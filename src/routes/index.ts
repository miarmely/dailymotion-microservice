import express from "express"
import * as cont from "../controllers"
import * as validate from "../controllers/validations"

const router = express.Router();

router.post("/video/upload", validate.uploadVideoAsync, cont.uploadVideoAsync);

export default router;