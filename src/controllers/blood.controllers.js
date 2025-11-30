import mongoose, { isValidObjectId } from "mongoose";
import { Blood } from "../models/blood.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create donate by user 
const bloodDonate = asyncHandler(async(req, res)=> {
    const { name, age, bloodGroup, address} = req.body
console.log(req.body)
    if(
        [name, age, bloodGroup, address].some(
            (field) => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    
    /*

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
    }*/

    const bloodUpload = await Blood.create({
        name, 
        age,
        bloodGroup,
        address 
    })

    if(!bloodUpload) {
        throw new ApiError(500, "Blood donation creation failed")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, bloodUpload, "Blood donation successfully submitted"))
});
/*
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
*/
export {
    bloodDonate,
   // updateAid,
   // deleteAid,
};
