"use strict";
/* Partner resources using by "Controller" and it's "Workers". */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueNames = exports.miarMq = exports.BASE_URL_PUBLIC_KEY = exports.BASE_URL_PRIVATE_KEY = void 0;
exports.getBaseUrl = getBaseUrl;
const miar_rabbitmq_1 = require("../../../lib/miar-rabbitmq");
const envConfig_1 = __importDefault(require("../../../config/envConfig"));
//////////////////// VARIABLES ////////////////////
exports.BASE_URL_PRIVATE_KEY = "https://partner.api.dailymotion.com";
exports.BASE_URL_PUBLIC_KEY = "https://api.dailymotion.com";
exports.miarMq = new miar_rabbitmq_1.MiarRabbitMQ(envConfig_1.default.RABBITMQ_URL);
exports.queueNames = {
    UPLOAD_VIDEO_BY_PASS: "IhaNews_VideoUpload_Password",
    UPLOAD_VIDEO_BY_CLIENT: "IhaNews_VideoUpload_ClientCredentials",
};
//////////////////// FUNCTIONS ////////////////////
function getBaseUrl(keyType) {
    return keyType == "public" ?
        exports.BASE_URL_PUBLIC_KEY
        : exports.BASE_URL_PRIVATE_KEY;
}
