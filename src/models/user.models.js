import mongoose, { Schema } from "mongoose" ;
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim: true,
            index: true
        },
        contact: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        address: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        location:{
            type:{
                type: String, enum: ["Point"], default: "Point"
            },
            coordinates: {
                type: [Number],
                index: "2dsphere"
            }
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        bloodGroup: {
            type: String,
            required: true,
        },
        age: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            required: true,
        },
        profileImage: {
            type: String, //cloudinary url
        },
        password: {
            type: String,
            required :[true, "Password is required"]
        }
    },{timestamps:true})
// geospatial index help to execute geospatial queries
//  userSchema.index({location: '2dsphere'});

//Before saving data encrypt the password using (bcrypt) middleware
userSchema.pre("save", async function (next) {

//if password doesn't change then no need to encrypt again direct move to next()
    if(!this.isModified("password")) return next();
    
//if password change encrypt again
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password) 
}

//generate_access_token and generate_refresh_token to create jwt for user authentication
userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
//this method access token contain these information
            _id:this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
//this method access token contain this information
        {
            _id:this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)