/* Partner resources using by "Controller" and it's "Workers". */

import env from "../../../config/envConfig"
import { MiarRabbitMQ } from "../../../lib/miar-rabbitmq";

//////////////////// VARIABLES ////////////////////
export const BASE_URL_PRIVATE_KEY = "https://partner.api.dailymotion.com";
export const BASE_URL_PUBLIC_KEY = "https://api.dailymotion.com";
export const miarMq = new MiarRabbitMQ(env.RABBITMQ_URL);
export const queueNames = {
    UPLOAD_VIDEO: "iha_news_video_upload"
};

//////////////////// FUNCTIONS ////////////////////
export function getBaseUrl() {
    return env.KEY_TYPE == "public" ?
        BASE_URL_PUBLIC_KEY
        : BASE_URL_PRIVATE_KEY;
}