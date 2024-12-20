import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// its is asynchoronous and return a promise which we access in index.js(main)
const connectDB = async () => {
    const dbUrl = `${process.env.MONGODB_URL}/${DB_NAME}`;
    console.log("Connecting to MongoDB at:", dbUrl); // Debugging output

    try {
        const connectionInstance = await mongoose.connect(dbUrl, {
        //use for better connectivity
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MONGODB connection failed: ", error.message);
        process.exit(1);
    }
};

export default connectDB;