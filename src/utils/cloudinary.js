import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload using buffer (for multer.memoryStorage)
export const uploadOnCloudinary = async (fileBuffer) => {
    try {
        if (!fileBuffer) return null;

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    folder: "volunteers"     // optional: organize uploads
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return reject(error);
                    }
                    resolve(result);
                }
            );

            uploadStream.end(fileBuffer); // upload file buffer to Cloudinary
        });

        return result;

    } catch (error) {
        console.error("Cloudinary upload_stream failed:", error.message);
        return null;
    }
};


// Delete resource from Cloudinary
export const deleteResourceOnCloudinary = async (url) => {
    try {
        if (!url) throw new Error("URL is required");

        // Extract public ID from URL
        const parts = url.split("/");
        const filename = parts.pop(); // last segment
        const [publicId, extension] = filename.split(".");

        // Determine resource type
        let type = "image";
        if (["mp4", "mov", "avi"].includes(extension)) type = "video";
        if (["pdf", "txt", "doc", "zip"].includes(extension)) type = "raw";

        // Delete resource
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: type,
        });

        if (response.result === "ok") {
            console.log(`Deleted Cloudinary resource: ${publicId}`);
        } else {
            console.log(`Failed to delete resource:`, response);
        }

        return response;

    } catch (error) {
        console.error("Cloudinary delete error:", error.message);
        return null;
    }
};
