"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// move variables in ".env" file to "process.env"
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const miar_log_1 = __importDefault(require("./lib/miar-log"));
const envConfig_1 = __importDefault(require("./config/envConfig"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use("/api", routes_1.default);
app.listen(envConfig_1.default.PORT, () => {
    miar_log_1.default.info(`Server with ${envConfig_1.default.PORT} is listening. (baseUrl: ${envConfig_1.default.BASE_URL})`);
});
