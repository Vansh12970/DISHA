import { Router } from "express";
import { getSafeRoute } from "../controllers/safeRoutes.controllers.js";
//import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()
/////////////////////////////////verifyJWT,
router.route("/safe-route").post(getSafeRoute)

export default router