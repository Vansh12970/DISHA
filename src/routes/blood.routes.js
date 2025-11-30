import { Router } from "express";
import { bloodDonate
} from "../controllers/blood.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT);

router.route("/make-bloodDonation").post(bloodDonate)

/*
router
    .route("/:aidId")
    .patch(updateAid)
    .delete(deleteAid)
*/
export default router