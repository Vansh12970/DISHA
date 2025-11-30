import mongoose from "mongoose";
import { Volunteer } from "../models/volunteer.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { 
    deleteResourceOnCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";


// Apply for a volunteer
const applyAsVolunteer = asyncHandler(async(req, res) => {
    const {fullName, contactDetails, address, city, state, useUserDetails} = req.body
    console.log(req.body)
  //  const {fullName, contactDetails, address, city, state} = req.body
  /*if(
    [fullName, contactDetails, address, city, state].some(
        (field) => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
    )
)*/
    if(
        [fullName, contactDetails].some(
            (field) => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All field are required")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(req.files)
    
    if(!avatarLocalPath) {
        throw new ApiError(400, "Image file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Image Uploading failed")
    }

// Import details of user from user schema
    let finalAddress = address;
    let finalCity = city;
    let finalState = state;

    if(useUserDetails) {
        // fetch detils from user db if user want 
        const user = await User.findById(req.user._id);

        if(!user) {
            throw new ApiError(404, "User Details Not Found");
        }

        finalAddress =user.address || finalAddress;
        finalCity = user.city || finalCity;
        finalState = user.state || finalState;
    }

    // validate that the address fields are filled
    if(
        [finalAddress, finalCity, finalState].some(
            (field) => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
    )) {
        throw new ApiError(400, "Address, state, city fields are required")
    }


    const volunteerUpload = await Volunteer.create({
        avatar: avatar.url,
        fullName,
        contactDetails, 
        address : finalAddress,
        city : finalCity,
        state : finalState,
    });

    if(!volunteerUpload) {
        throw new ApiError(500, "Failed to upload the data")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, volunteerUpload, "Volunteer Details Successfully Uploaded"))
});

// Update the volunteer details
const updateVolunteer = asyncHandler(async(req, res) => {
    const{ volunteerId } = req.params;
    const{ fullName, contactDetails, address, city, state } = req.body;

    const avatar = await Volunteer.findById(volunteerId);
    if(!avatar) {
        throw new ApiError(404, "Avatar is not found")
    }

    const avatarLocalPath = req.file?.path;
    const newAvatar = await uploadOnCloudinary(avatarLocalPath);

    if(!newAvatar) {
        throw new ApiError(500, "Avatar Upload on cloudinary failed")
    }

    const volunteerUpload = await Volunteer.findByIdAndUpdate(volunteerId,
        {
            $set: {
                avatar: newAvatar.url,
                fullName: fullName,
                contactDetails: contactDetails,
                address: address,
                city: city,
                state: state
            }
        },
        {
            new: true
        }
    );

    if(!volunteerUpload) {
        throw new ApiError(500, "Failed to update details")
    }

    await deleteResourceOnCloudinary(avatar)

    return res
    .status(200)
    .json(new ApiResponse(200, volunteerUpload, "Details Updated Successfully"))
})

// Delete the volunteer
const deleteVolunteer = asyncHandler(async(req, res) => {
        const { volunteerId } = req.params;
    
        // Find the volunteer record by ID
        const volunteer = await Volunteer.findById(volunteerId);
        
        if (!volunteer) {
            throw new ApiError(404, "Volunteer not found");
        }
    
        // Delete the associated avatar from Cloudinary
        const avatarUrl = volunteer.avatar;  // Assuming the avatar is stored as a URL
        if (avatarUrl) {
            await deleteResourceOnCloudinary(avatarUrl);
        }
    
        // Delete the volunteer record from the database
        const deletedVolunteer = await Volunteer.findByIdAndDelete(volunteerId);
    
        if (!deletedVolunteer) {
            throw new ApiError(500, "Failed to delete the volunteer");
        }
    
        return res
            .status(200)
            .json(new ApiResponse(200, deletedVolunteer, "Volunteer Deleted Successfully"));
    });
    
export {
    applyAsVolunteer,
    updateVolunteer,
    deleteVolunteer
}