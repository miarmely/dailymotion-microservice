import express from "express"
import * as cont from "../controllers"

const router = express.Router();

router.post("/video/upload", cont.uploadVideoAsync);

export default router;