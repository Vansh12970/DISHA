import mongoose, {isValidObjectId} from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async(req, res) => {

})

const getUserTweets = asyncHandler(async(req, res) => {

})

const deleteTweet = asyncHandler(async (req, res) => {

})

export {
    createTweet,
    getUserTweets,
    deleteTweet,
}