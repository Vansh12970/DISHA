import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Report } from "../models/report.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteResourceOnCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import geolib from "geolib";
import twilio from "twilio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//const helplineNumber = "Fire Service: 101, Police: 100, Ambulance: 102";


const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMSToUser = (contact, message) => {
    const formattedContact = contact.startsWith('+') ? contact : `+91${contact}`;
    twilioClient.messages
        .create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedContact,
        })
        .then(message => console.log(`SMS sent to ${formattedContact}: ${message.sid}`))
        .catch(error => console.error(`Failed to send SMS to ${formattedContact}:`, error));
};


//  Fetch video and convert to base64
async function fetchVideoAsBase64(videoUrl) {
    console.log(" Video URL received:", videoUrl);

    if (!videoUrl || typeof videoUrl !== 'string' || !videoUrl.startsWith('http')) {
        throw new Error("Invalid video URL");
    }

    const res = await axios.get(videoUrl, { responseType: "arraybuffer" });
    return Buffer.from(res.data).toString("base64");
}


async function verifyDisasterWithGemini(title, description, location, videoUrl) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `
Check if the following disaster report is real by checking current news and social media. 
Respond with only "TRUE" if it's currently happening (Today or Yesterday) or "FALSE" if it's outdated or fake.
Also, check for similar disaster incidents within 100km of the provided location.

Title: ${title}
Description: ${description}
Location: ${JSON.stringify(location)}
Date: ${new Date().toLocaleDateString()}
`;

    try {
   
        const base64Video = await fetchVideoAsBase64(videoUrl);

        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType: "video/mp4", 
                    data: base64Video,
                },
            }
        ]);

        const response = await result.response.text();
        console.log(" Gemini response:", response);

        return response.includes("TRUE");
    } catch (error) {
        console.error(" Gemini verification failed:", error);
        return false;
    }
}

async function getPincodeFromCoordinates(lat, lon) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
        );
        const data = await response.json();
       // console.log('Geocode API response:', JSON.stringify(data, null, 2)); 

        const addressComponents = data.results[0]?.address_components;
        const postalCode = addressComponents?.find(comp =>
            comp.types.includes('postal_code')
        )?.long_name;

        if (postalCode) {
            console.log('Postal code:', postalCode); 
            return postalCode;
        } else {
            throw new Error('No postal code found');
        }
    } catch (error) {
        console.error('Error fetching pincode from coordinates:', error);
        throw error;
    }
}

async function getCoordinatesFromPincode(pincode) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${apiKey}`
        );
        const data = await response.json();
        const location = data.results[0]?.geometry.location;
        return location ? { lat: location.lat, lon: location.lng } : null;
    } catch (error) {
        console.error('Error fetching coordinates from pincode:', error);
        throw error;
    }
}

async function sendDisasterAlert(pincode, disasterMessage) {
    try {
        const reportedLocation = await getCoordinatesFromPincode(pincode);
        if (!reportedLocation) throw new Error('Could not get location for the pincode');

        if (typeof reportedLocation === 'string') {
            reportedLocation = JSON.parse(reportedLocation);
        }

        const users = await User.find({});
        console.log(`Total users fetched: ${users.length}`);

        const nearbyUsers = [];

        for (const user of users) {
            if (!user.pincode) {
                console.log(`User ${user._id} missing pincode`);
                continue;
            }

            // Get user's location from their pincode
            const userLocation = await getCoordinatesFromPincode(user.pincode);
            if (!userLocation) {
                console.log(`Could not get location for user ${user._id} with pincode ${user.pincode}`);
                continue;
            }

            console.log(`User ${user._id} location:`, userLocation);

            const distance = geolib.getDistance(
                { latitude: reportedLocation.lat, longitude: reportedLocation.lon },
                { latitude: userLocation.lat, longitude: userLocation.lon }
            );

            console.log(`Distance to user ${user._id}:`, distance);

            if (distance <= 100000) { // 100 km in meters
                nearbyUsers.push(user);
            }
        }

        console.log(`Found ${nearbyUsers.length} users within 100 km of pincode ${pincode}`);

        nearbyUsers.forEach(user => {
            sendSMSToUser(user.contact, disasterMessage);
        });
    } catch (error) {
        console.error('Error sending disaster alerts:', error);
    }
}

// upload the report
const sendVideoReport = asyncHandler(async (req, res) => {
    const {title, description, location} = req.body;

    const parsedLocation = JSON.parse(location);
    console.log(typeof location)
    console.log(req.body)

    if(!(title.trim() && description.trim())) {
        throw new ApiError(400, "Report title and description is required!");
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath) {
        throw new ApiError(400, "Video File is Required");
    }

    const video = await uploadOnCloudinary(videoLocalPath);

    if(!video) {
        throw new ApiError(400, "Video uploading failed");
    }

    const videoUpload = await Report.create({
        videoFile: video.url,
        title,
        description,
        location: parsedLocation,
        owner: req.user?._id,
    });

    if(!videoUpload) {
        throw new ApiError(500, "Failed to upload the video");
    }

    const disasterPincode = await getPincodeFromCoordinates(parsedLocation.lat, parsedLocation.lon);
    if(!disasterPincode) {
        console.error("Failed to fetch disaster location pincode");
        return;
    }
    
            // Gemini verification before sending alert
const isRealDisaster = await verifyDisasterWithGemini(title, description, parsedLocation, video.url);

if (isRealDisaster) {
    const disasterMessage = `🚨 URGENT: Disaster Alert in your area \n\n⚠️ Stay indoor if possible and avoid risky areas.\n\n Your safety is our priority 🤝. Stay safe, stay strong!`;
    await sendDisasterAlert(disasterPincode, disasterMessage);
} else {
    console.log("🚫 Fake Alert: Disaster is not verified by Gemini. No SMS will be sent.");
}

    return res
    .status(200)
    .json(new ApiResponse(200, videoUpload, "Video Uploaded Successfully and alert send"));
});

// update the report controller
const updateVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params;
    const {title, description} = req.body;

    const video = await Report.findById(videoId);
    if(!video) {
        throw new ApiError(404, "video is not found")
    }

    // check the owner of video is user
    if(video.owner.toString() !== req.user?._id.toString()) { 
        throw new ApiError(400, "Unauthorized: You are not authorized to make changes")
    };

    //Update video details in database 
    const videoUpdate = await Report.findByIdAndUpdate(videoId,
        {
            $set: {
                title: title,
                description: description,
            }
        },
        {
            new : true
        }
    );

    if(!videoUpdate) {
        throw new ApiError(500, "Failed to update the details");
    }
    
    return res
    .status(200)
    .json(new ApiResponse(200, videoUpdate, "Details Updated Successfully"))
})

//Delete the video controller
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Report.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video is not found");
    }

    //check user is owner of video
    if(video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Unauthorized: You are not able to make changes")
    };

    const deleteVideo = await Report.findByIdAndDelete(video._id);

    if(!deleteVideo) {
        throw new ApiError(500, "Failed to delete the Video");
    }

    await deleteResourceOnCloudinary(deleteVideo?.videoFile);

    return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"))
})

// Toggle publish status of video controller
const togglePublishStatus = asyncHandler (async(req, res) => {
    const { videoId } =req.params;

    const video = await Report.findById(videoId);

    if(!video) {
        throw new ApiError(500, "Video not found");
    }
    //check user is authorized
    if(video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Unauthorized: you are not authorized to change publish status")
    }

    video.isPublished = !video.isPublished;
    const updateVideo = await video.save({validateBeforeSave: false});

    if(!updateVideo) {
        throw new ApiError(500, "Failed to toggle publish status of video");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video Publish Status Updated Successfully"));

})

export {
    sendVideoReport,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
}

