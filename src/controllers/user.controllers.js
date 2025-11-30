import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

// Define to generate the accesstoken and refreshtoken for user to login and logout
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        
        const user = await User.findById(userId)
        const accessToken  = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
// Don't check any necessary requirement define in user model
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something Went Wrong while generating accesstoken and refreshtoken")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username,contact, password, address, pincode, state, city, bloodGroup, age, gender} = req.body;
     console.log(req.body);
    // Validate required fields
    if (
        [fullName, email, username, password, contact, address, pincode, state, city, bloodGroup, age, gender].some(
            (field) => field === undefined || field === null || (typeof field === "string" && field.trim() === "")
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

   
    // Handle profileImage upload
    let profileImageLocalPath;
    if (req.files && Array.isArray(req.files.profileImage)
    && req.files.profileImage.length > 0) {
        profileImageLocalPath = req.files.profileImage[0].path}
   
    const profileImage = await uploadOnCloudinary(profileImageLocalPath)
 
    // Store in database
    const user = await User.create({
        fullName,
        email,
        contact,
        password, 
        username: username.toLowerCase(),
        profileImage: profileImage?.url || "",
        city,
        state,
        bloodGroup,
        age,
        gender,
        address,
        pincode,
    });

    // Fetch the created user excluding sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    // When user successfully created
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {

const {email, password} = req.body

if(!email && !password) {
    throw new ApiError(400, "Email and Password is required")
}
//find user in mongodb
const user = await User.findOne({
    $or: [{email}, {password}]
})

if(!user) {
    throw new ApiError(404, "User does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid) {
    throw new ApiError(401, "Invalid Password")
}

const {accessToken, refreshToken} = await
generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).
select("-password -refreshToken")

const options = {
    httpOnly: true,
    secure: true
}

return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200, {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged In Successfully"
    )
)

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User LoggedOut Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) =>{
    const incomingRefeshToken = req.cookies.refreshToken || req.body.refreshToken

    if (incomingRefeshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefeshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )

        const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if(incomingRefeshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken, options},
                "Access Token Refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const forgetPassword = asyncHandler(async (req, res) => {

    const {email, newPassword, confPassword} = req.body

    if(!(newPassword === confPassword)){
        throw new ApiError(401, "New Password and ConfPassword are not same")
    }

   if(!email && !newPassword) {
    throw new ApiError(400, "Email and New Password Required")
   }

   const user = await User.findOne({email})

   if(!user) {
    throw new ApiError(401, "Invalid Email or user doesn't exist with this email")
   }
   user.password = newPassword
   await user.save({validateBeforeSave: false})
   
   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.User, "Current User fetched successfully"))
})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    forgetPassword,
    getCurrentUser, 
};
//export with variable import with variable
//console.log("Exporting registerUser:", typeof registerUser);
