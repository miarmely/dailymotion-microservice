// move variables in ".env" file to "process.env"
import dotenv from "dotenv"
dotenv.config();

import express from "express"
import bodyParser from "body-parser";

import miarLog from "../../Layer_Library/src/miar-log"
import env from "../../Layer_Entity/src/configs/env-config"
import routes from "../../Layer_Presentation/src/routes"

const app = express();

app.use(bodyParser.json());
app.use("/api", routes);

app.listen(env.PORT, () => {
    // activate workers
    await workers.uploadVideoByPasswordAsync();
    await workers.uploadVideoByClientCredentialsAsync();
    miarLog.log("Info", `All workers is activated.`);

    miarLog.log("Info", `Server with ${env.PORT} is listening. (baseUrl: ${env.BASE_URL})`);
})