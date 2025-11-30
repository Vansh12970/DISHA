import { Router } from "express";
import { makeAid,
         updateAid,
         deleteAid,
} from "../controllers/aid.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT);

router.route("/make-aid").post(makeAid)

router
    .route("/:aidId")
    .patch(updateAid)
    .delete(deleteAid)

export default router