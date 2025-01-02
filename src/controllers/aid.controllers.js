import mongoose, { isValidObjectId } from "mongoose";
import { Aid } from "../models/report.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create aid by user 
const makeAid = asyncHandler(async(req, res)=> {
    const { aidType, description, quantity, address, city, contactDetails, state} = req.body

    if(
        [aidType, description, quantity, address, city, contactDetails, state].some(
            (field) => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const aidUpload = await Aid.create({
        aidType,
        description, 
        quantity, 
        address, 
        city, 
        contactDetails, 
        state,
    })

    if(!aidUpload) {
        throw new ApiError(500, "Aid creation failed")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, aidUpload, "Aid successfully submitted"))
});

// update the aid 
const updateAid = asyncHandler(async(req, res) => {
    const { aidId } = req.params
    const {aidType, description, quantity, address, city, contactDetails, state} = req.body

    if(!aidId || !isValidObjectId(aidId)) {
        throw new ApiError(400, "Invalid aid Id")
    }

    if(
        [aidType, description, quantity, address, city, contactDetails, state].some(
            (field) => field?.trim === ""
        )
    ) {
        throw new ApiError(400, "All fields are required")
    };

    const aidUpload = await Aid.findByIdAndUpdate(aidId,
            {
                $set:{
                    aidType: aidType,
                    description: description,
                    quantity: quantity,
                    address: address,
                    city: city,
                    contactDetails: contactDetails, 
                    state: state,
                }
            },
            {new: true}
    )

    if(!aidUpload) {
        throw new ApiError(500, "Failed to update the details")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, aidUpload, "Details have been successfully updated"))
})

// delete the aid 
const deleteAid = asyncHandler(async(req, res) => {
   const {aidId} = req.params;

   if(!aidId || !isValidObjectId(aidId)) {
     throw new ApiError(400, "Invalid aid ID");
   }

   const aid =  await Aid.findById(aidId);
   if(!aid) {
    throw new ApiError(404, "Aid doucment not found");
   }
   
   //Delete aid 
   const deleteAid = await Aid.findByIdAndDelete(aidId);

   if(!deleteAid) {
    throw new ApiError(500, "Failed to delete the aid documnet");
   }

   return res
   .status(200)
   .json(new ApiResponse(200, null, "Aid successfully deleted"))
});

export {
    makeAid,
    updateAid,
    deleteAid,
};
