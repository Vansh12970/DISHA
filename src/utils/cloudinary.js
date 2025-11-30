import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Configurations of cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        //console.log("File is uploaded on cloudinary",
        //response.url);
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch(error) {
        fs.unlinkSync(localFilePath)
        //remove the locally saves temporary file asupload operation failed
        return null;
    }
}

const deleteResourceOnCloudinary = async(url) => {
   try {
     if(!url) {
        throw new Error("URL is required");
     }

     //extract the public Id and file extension
     const parts = url.split("/")
     const fileNameWithExtension = parts.pop();
     const [publicId, extension] = fileNameWithExtension.split(".")

     //determine the resource type based on extension
     let type = "image";
     if(["mp4", "mov", "avi"].includes(extension)) {
        type = "video";
     } else if (["pdf", "txt", "doc", "zip"].includes(extension)) {
        type = "raw";
     }

     //delete the resource 
     const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: type
     });

     if(response.result === "ok") {
        console.log(`Resource successfully deleted: ${publicId}`);
     } else {
        console.log(`Failed to delete rsource: ${response}`)
     }
     return response;

   } catch (error) {
     console.error("Error deleting resource on cloudinary: ", error.message);
     return null;
   }
}
export { 
    uploadOnCloudinary,
    deleteResourceOnCloudinary,
 }