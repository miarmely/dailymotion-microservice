import express from "express"
import bodyParser from "body-parser";

import miarLog from "./lib/miar-log"
import env from "./config/envConfig"
import route from "./routes"

const app = express();

app.use(bodyParser.json());
app.use("/api", route);

app.listen(env.PORT, () => {
    miarLog.infoWithDate(`Server with ${env.PORT} is listening. (baseUrl: ${env.BASE_URL})`);
})