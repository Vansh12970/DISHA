// function to connect database export to main index.js file
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// its is asynchoronous and return a promise which we access in index.js(main)
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection failed: ", error.message);
        process.exit(1);
    }
}

export default connectDB;