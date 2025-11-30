import { Router } from "express";
import { registerUser,
         loginUser,
         logoutUser,
         refreshAccessToken,
         forgetPassword,
         getCurrentUser   
} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

//console.log("registerUser: ", registerUser)
//console.log("upload: ", upload)

router.route("/register").post(
    
   /* upload.fields([
        {
            name: "profileImage",
            maxCount: 1,
        },
    ]),*/
    registerUser)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser) 
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(forgetPassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)



export default router