import express from "express"
import * as ctl from "../controllers"
import gmValidation from "../validations/general-model-validation"

const router = express.Router();

router.post("/video/upload/password",
    validate.uploadVideoByPassword,
    ctl.uploadVideoByPassword
);
router.post("/video/upload/client-credentials",
    validate.uploadVideoByClientCredentials,
    ctl.uploadVideoByClientCredentials
);

export default router;