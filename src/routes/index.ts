import express from "express"
import * as ctl from "../controllers"
import * as validate from "../controllers/validations"

const router = express.Router();

router.post("/video/upload",
    validate.uploadVideo,
    ctl.uploadVideo
);
router.post("/accessToken/password/get",
    validate.getAccessTokenByPassword,
    ctl.getAccessTokenByPassword
);
router.post("/accessToken/clientCredentials/get",
    validate.getAccessTokenByClientCredentials,
    ctl.getAccessTokenByClientCredentials
);

export default router;