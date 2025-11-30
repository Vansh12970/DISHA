import { Router } from "express";
import {
    sendVideoReport,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/report.controllers.js"
//import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

//router.use(verifyJWT);

router
    .route("/video-report")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
        ]),
        sendVideoReport
    );

router
    .route("/:videoId")
    .delete(deleteVideo)
    .patch(updateVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router
