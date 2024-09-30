import express from "express"
import * as cont from "../controllers"
import * as validate from "../controllers/validations"

const router = express.Router();

router.post("/video/upload",
    validate.uploadVideo,
    cont.uploadVideo
);
router.post("/accessToken/password/get",
    validate.getAccessTokenByPassword,
    cont.getAccessTokenByPassword
);
router.post("/accessToken/clientCredentials/get",
    validate.getAccessTokenByClientCredentials,
    cont.getAccessTokenByClientCredentials
);

export default router;