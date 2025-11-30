import { Router } from "express";
import { makeDonate,
} from "../controllers/money.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT);

router.route("/make-moneyDonation").post(makeDonate)

/*
router
    .route("/:aidId")
    .patch(updateAid)
    .delete(deleteAid)
*/
export default router