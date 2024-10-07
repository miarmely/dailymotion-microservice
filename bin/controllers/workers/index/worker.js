"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = uploadVideo;
const miar_time_1 = __importDefault(require("../../../lib/miar-time"));
const miar_log_1 = __importDefault(require("../../../lib/miar-log"));
const miar_axios_1 = __importDefault(require("../../../lib/miar-axios"));
const miar_error_1 = require("../../../lib/miar-error");
const miar_enum_1 = require("../../../lib/miar-enum");
const shared = __importStar(require("./sharedResources"));
////////////////// EXPORTS //////////////////
function uploadVideo() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let videoTitle = "";
        let publishInfo;
        // upload video to dailymotion
        try {
            const qName = shared.queueNames.UPLOAD_VIDEO;
            yield shared.miarMq.connectAsync();
            yield ((_a = shared.miarMq.channel) === null || _a === void 0 ? void 0 : _a.assertQueue(qName, { durable: true }));
            yield ((_b = shared.miarMq.channel) === null || _b === void 0 ? void 0 : _b.prefetch(1)); // process only one message at same time
            yield ((_c = shared.miarMq.channel) === null || _c === void 0 ? void 0 : _c.consume(qName, (msg) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                // when queue is empty
                if (!msg)
                    return;
                { // consume queue
                    let body;
                    try {
                        body = JSON.parse(msg.content.toString());
                        const accessToken = body.access_token;
                        const userId = body.user_id;
                        const videoDownloadLink = body.video_download_link;
                        const description = body.description;
                        const channel = body.channel;
                        const isCreatedForKids = body.is_created_for_kids;
                        const country = body.country;
                        const language = body.language;
                        const videoTitle = body.title;
                        // create video
                        var creationRes = yield createVideoAsync(accessToken, userId, videoDownloadLink);
                        if (!creationRes.success)
                            throw new miar_error_1.MiarError(creationRes.data.status, creationRes.data.message);
                        // publish video
                        const videoId = creationRes.data.id;
                        const publishRes = yield publishVideoAsync(accessToken, videoId, // video id
                        videoTitle, description, channel, isCreatedForKids, country, language);
                        if (!publishRes.success)
                            throw new miar_error_1.MiarError(publishRes.data.status, publishRes.data.message);
                        publishInfo = publishRes.data;
                        // save log
                        const creationInfo = creationRes.data;
                        const croppedVideoTitle = (videoTitle.length <= 30 ?
                            videoTitle
                            : videoTitle.substring(0, 30) + "...");
                        miar_log_1.default.info("Video is uploaded to dailymotion. " +
                            `(video_id: ${creationInfo.id}) ` +
                            `(video_title: ${croppedVideoTitle})`);
                        // wait 5 min
                        const minForSleep = 5;
                        miar_log_1.default.info(`Waiting about ${minForSleep} minute...`);
                        yield miar_time_1.default.sleepAsync(minForSleep * 60 * 1000);
                        (_a = shared.miarMq.channel) === null || _a === void 0 ? void 0 : _a.ack(msg);
                    }
                    catch (err) {
                        // save log
                        const error = err;
                        miar_log_1.default.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${error.message})`, body);
                        // wait 30 min
                        const minForSleep = 30;
                        miar_log_1.default.info(`Waiting about ${minForSleep} minute...`);
                        yield miar_time_1.default.sleepAsync(minForSleep * 60 * 1000);
                        (_b = shared.miarMq.channel) === null || _b === void 0 ? void 0 : _b.nack(msg, false, true);
                    }
                }
            })));
        }
        catch (err) {
            const error = err;
            miar_log_1.default.error(`General - Worker of "uploadVideo" didn't executed. ` +
                `(error_message: ${error.message})`);
        }
    });
}
////////////////// PRIVATE //////////////////
function createVideoAsync(accessToken, userId, downloadLink) {
    return __awaiter(this, void 0, void 0, function* () {
        let x = `${shared.getBaseUrl()}/user/${userId}/videos`;
        const res = yield miar_axios_1.default.axiosAsync({
            url: `${shared.getBaseUrl()}/user/${userId}/videos`,
            method: "POST",
            headers: {
                "Content-Type": miar_enum_1.MiarContentType.urlencoded,
                Authorization: "Bearer " + accessToken,
            },
            data: { url: downloadLink }
        });
        return res;
    });
}
function publishVideoAsync(accessToken, videoId, title, description, channel, isCreatedForKids, country, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield miar_axios_1.default.axiosAsync({
            url: shared.getBaseUrl() + "/video/" + videoId,
            method: "POST",
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": miar_enum_1.MiarContentType.urlencoded,
            },
            data: {
                published: true,
                title: title,
                description: description,
                channel: channel,
                tag: ["news", "sport"],
                //thumbnail_url: videoPosterPath,
                language: language,
                is_created_for_kids: isCreatedForKids,
                country: country,
            }
        });
        return res;
    });
}
