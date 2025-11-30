import { Router } from "express";
import {
    applyAsVolunteer,
    updateVolunteer,
    deleteVolunteer
} from "../controllers/volunteer.controllers.js"
//import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"

const router = Router();
// router.use(verifyJWT);

router
    .route("/")
    .post(
        upload.fields([
            {
                name: "avatar",
                maxCount: 1,
            },
        ]),
        applyAsVolunteer
    );

router
    .route("/:volunteerId")
    .patch(upload.single("avatar"), updateVolunteer)
    .delete(deleteVolunteer)

export default router