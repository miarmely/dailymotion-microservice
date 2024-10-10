/* Partner resources using by "Controller" and it's "Workers". */

import { MiarRabbitMQ } from "../../../lib/miar-rabbitmq";
import env from "../../../config/envConfig"
import { KeyType } from "../../../models/typeModels";

//////////////////// VARIABLES ////////////////////
export const BASE_URL_PRIVATE_KEY = "https://partner.api.dailymotion.com";
export const BASE_URL_PUBLIC_KEY = "https://api.dailymotion.com";
export const miarMq = new MiarRabbitMQ(env.RABBITMQ_URL);
export const queueNames = {
    UPLOAD_VIDEO_BY_PASS: "IhaNews_VideoUpload_Password",
    UPLOAD_VIDEO_BY_CLIENT: "IhaNews_VideoUpload_ClientCredentials",
};

//////////////////// FUNCTIONS ////////////////////
export function getBaseUrl(keyType: KeyType) {
    return keyType == "public" ?
        BASE_URL_PUBLIC_KEY
        : BASE_URL_PRIVATE_KEY;
}