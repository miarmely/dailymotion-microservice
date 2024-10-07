// move variables in ".env" file to "process.env"
import dotenv from "dotenv"
import express from "express"
dotenv.config();

import miarLog from "./lib/miar-log";
import env from "./config/envConfig"
import { uploadVideo } from "./controllers/workers/index/worker";

const app = express();

app.listen(env.PORT_WORKERS, () => {
    miarLog.info(`Workers is running at ${env.PORT_WORKERS} port.`);

    // initialize workers
    uploadVideo();
})