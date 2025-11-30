import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js'


// Load environment variables
dotenv.config({
    path: './.env',
})


connectDB()

.then(() => {
    app.listen(process.env.PORT || 8080, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch ((error) => {
     console.log("MONGODB connection failed!!!! ", error);
})




















