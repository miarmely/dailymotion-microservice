// move variables in ".env" file to "process.env"
import dotenv from "dotenv"
import express from "express"
dotenv.config();

import miarLog from "./lib/miar-log";
import env from "./config/envConfig"
import * as workers from "./controllers/workers/index/worker";

const app = express();

app.listen(env.PORT_WORKERS, async () => {
    // initialize workers
    await workers.uploadVideoByPasswordAsync();
    await workers.uploadVideoByClientCredentialsAsync();

    miarLog.info(`All workers is running at ${env.PORT_WORKERS} port.`);
})