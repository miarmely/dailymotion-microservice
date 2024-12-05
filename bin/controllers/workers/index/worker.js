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
exports.uploadVideoByPasswordAsync = uploadVideoByPasswordAsync;
exports.uploadVideoByClientCredentialsAsync = uploadVideoByClientCredentialsAsync;
const miar_log_1 = __importDefault(require("../../../lib/miar-log"));
const miar_axios_1 = __importDefault(require("../../../lib/miar-axios"));
const miar_error_1 = require("../../../lib/miar-error");
const miar_enum_1 = require("../../../lib/miar-enum");
const envConfig_1 = __importDefault(require("../../../config/envConfig"));
const shared = __importStar(require("./sharedResources"));
const qNamesAndTokens = { password: {}, client: {} };
//////////////////////// MAIN FUNCS ////////////////////////
/**
 * Upload video to Dailymotion by "password" grant type per "5 minute".
 */
function uploadVideoByPasswordAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const qName = shared.queueNames.UPLOAD_VIDEO_BY_PASS;
            yield shared.miarMq.connectAsync();
            yield ((_a = shared.miarMq.channel) === null || _a === void 0 ? void 0 : _a.assertQueue(qName, { durable: true }));
            yield ((_b = shared.miarMq.channel) === null || _b === void 0 ? void 0 : _b.prefetch(1)); // process only one msg at same time
            yield ((_c = shared.miarMq.channel) === null || _c === void 0 ? void 0 : _c.consume(qName, (msg) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                // when queue is empty
                if (!msg) {
                    miar_log_1.default.info("Queue is empty.");
                    return;
                }
                ;
                { // consume queue
                    let body;
                    try {
                        body = JSON.parse(msg.content.toString());
                        const apiKey = body.api_key;
                        const apiSecret = body.api_secret;
                        const scopes = body.scopes;
                        const username = body.username;
                        const password = body.password;
                        const downloadLink = body.video_download_link;
                        const description = body.description;
                        const channel = body.channel;
                        const isCreatedForKids = body.is_created_for_kids;
                        const country = body.country;
                        const language = body.language;
                        const videoTitle = body.title;
                        // update access token if expired or invalid
                        const isSuccess = yield updateAccessTokenIfRequired("password", qName, apiKey, apiSecret, scopes, username, password);
                        if (!isSuccess)
                            throw new miar_error_1.MiarError(5000, "");
                        // upload video
                        const tokenInfo = qNamesAndTokens.password[qName];
                        const creationAndPublishRes = yield createAndPublishVideoAsync("public", tokenInfo.accessToken, tokenInfo.userId, downloadLink, channel, videoTitle, description, isCreatedForKids, country, language);
                        if (!creationAndPublishRes.success)
                            throw new miar_error_1.MiarError(5001, creationAndPublishRes.data.message);
                        // save log
                        const data = creationAndPublishRes.data;
                        const croppedVideoTitle = (videoTitle.length <= 30 ?
                            videoTitle
                            : videoTitle.substring(0, 30) + "...");
                        miar_log_1.default.info("Video is uploaded to dailymotion. " +
                            `(username: ${username}) ` +
                            `(video_id: ${data.id}) ` +
                            `(video_title: ${croppedVideoTitle})`);
                        // wait about "30 sec"
                        (_a = shared.miarMq.channel) === null || _a === void 0 ? void 0 : _a.ack(msg);
                        yield stopConsumingUntilSpecificTimeAsync(envConfig_1.default.waitTime.UPLOAD_BY_PASS_IN_MIN, uploadVideoByPasswordAsync);
                    }
                    catch (err) {
                        // save log
                        const miarErr = err;
                        miar_log_1.default.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${miarErr.message})`, body);
                        (_b = shared.miarMq.channel) === null || _b === void 0 ? void 0 : _b.nack(msg, false, true);
                        // start queue consuming again after "waitTime"
                        switch (miarErr.status) {
                            case 5000: // Access Token Error
                                yield stopConsumingUntilSpecificTimeAsync(2, uploadVideoByPasswordAsync);
                                break;
                            case 5001: // Upload Error
                                yield stopConsumingUntilSpecificTimeAsync(24 * 60, // 24 hour
                                uploadVideoByPasswordAsync);
                                break;
                        }
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
/**
 * Upload video to Dailymotion by "client credentials" grant type per "5 minute".
 */
function uploadVideoByClientCredentialsAsync() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const qName = shared.queueNames.UPLOAD_VIDEO_BY_CLIENT;
            yield shared.miarMq.connectAsync();
            yield ((_a = shared.miarMq.channel) === null || _a === void 0 ? void 0 : _a.assertQueue(qName, { durable: true }));
            yield ((_b = shared.miarMq.channel) === null || _b === void 0 ? void 0 : _b.prefetch(1)); // process only one msg at same time
            yield ((_c = shared.miarMq.channel) === null || _c === void 0 ? void 0 : _c.consume(qName, (msg) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                // when queue is empty
                if (!msg)
                    return;
                { // consume queue
                    let body;
                    try {
                        body = JSON.parse(msg.content.toString());
                        const apiKey = body.api_key;
                        const apiSecret = body.api_secret;
                        const scopes = body.scopes;
                        const channelUsername = body.channel_username;
                        const downloadLink = body.video_download_link;
                        const title = body.title;
                        const description = body.description;
                        const channel = body.channel;
                        const isCreatedForKids = body.is_created_for_kids;
                        const country = body.country;
                        const language = body.language;
                        // update access token if expired or invalid
                        const isSuccess = yield updateAccessTokenIfRequired("client_credentials", qName, apiKey, apiSecret, scopes);
                        if (!isSuccess)
                            throw new miar_error_1.MiarError(5000, "");
                        // upload video
                        const tokenInfo = qNamesAndTokens.client[qName];
                        const creationAndPublishRes = yield createAndPublishVideoAsync("private", tokenInfo.accessToken, channelUsername, downloadLink, channel, title, description, isCreatedForKids, country, language);
                        if (!creationAndPublishRes.success)
                            throw new miar_error_1.MiarError(5001, creationAndPublishRes.data.message);
                        // save log
                        const data = creationAndPublishRes.data;
                        const croppedVideoTitle = (title.length <= 30 ?
                            title
                            : title.substring(0, 30) + "...");
                        miar_log_1.default.info("Video is uploaded to dailymotion. " +
                            `(channel_username: ${channelUsername}) ` +
                            `(video_id: ${data.id}) ` +
                            `(video_title: ${croppedVideoTitle})`);
                        // wait about 1 min
                        (_a = shared.miarMq.channel) === null || _a === void 0 ? void 0 : _a.ack(msg);
                        yield stopConsumingUntilSpecificTimeAsync(envConfig_1.default.waitTime.UPLOAD_BY_CLIENT_IN_MIN, uploadVideoByClientCredentialsAsync);
                    }
                    catch (err) {
                        // save log
                        const miarErr = err;
                        miar_log_1.default.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${miarErr.message})`, body);
                        (_b = shared.miarMq.channel) === null || _b === void 0 ? void 0 : _b.nack(msg, false, true);
                        // wait before send request again
                        switch (miarErr.status) {
                            case 5000: // Access Token Error
                                yield stopConsumingUntilSpecificTimeAsync(2, uploadVideoByClientCredentialsAsync);
                                break;
                            case 5001: // Upload Error
                                yield stopConsumingUntilSpecificTimeAsync(24 * 60, // 24 hours
                                uploadVideoByClientCredentialsAsync);
                                break;
                                yield stopConsumingUntilSpecificTimeAsync(24 * 60, // 24 hours
                                uploadVideoByClientCredentialsAsync);
                                break;
                        }
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
//////////////////////// SUB-FUNCS ////////////////////////
/**
 * @param channelId If you are using "Public Key", enter "user id".
 * If you are using "Private Key", enter "channel username".
 */
function createAndPublishVideoAsync(keyType, accessToken, channelId, // PublicKey: userId | PrivateKey: channelUsername
downloadLink, channel, title, description, isCreatedForKids, country, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlByKeyType = (keyType == "public" ?
            shared.getBaseUrl(keyType) + "/user/" + channelId + "/videos"
            : shared.getBaseUrl(keyType) + "/rest/user/" + channelId + "/videos");
        const res = yield miar_axios_1.default.axiosAsync({
            url: urlByKeyType,
            method: "POST",
            headers: {
                Authorization: "Bearer " + accessToken,
                "Content-Type": miar_enum_1.MiarContentType.urlencoded,
            },
            data: {
                url: downloadLink, // mandatory
                channel: channel, // mandatory
                title: title, // mandatory
                description: description,
                tag: ["sport", "news"],
                language: language,
                is_created_for_kids: isCreatedForKids, // mandatory
                country: country,
                published: true, // mandatory
            }
        });
        return res;
    });
}
function stopConsumingUntilSpecificTimeAsync(waitTimeInMin, callbackAsync) {
    return __awaiter(this, void 0, void 0, function* () {
        // stop worker of associated queue
        yield shared.miarMq.disconnectAsync();
        // restart worker of associated queue after "waitTime"
        const waitTimeInMs = waitTimeInMin * 60 * 1000;
        setTimeout(() => __awaiter(this, void 0, void 0, function* () { return yield callbackAsync(); }), waitTimeInMs);
        // save log
        if (waitTimeInMin < 1)
            miar_log_1.default.info(`Waiting about ${waitTimeInMin * 60} seconds... `);
        else if (waitTimeInMin < 60)
            miar_log_1.default.info(`Waiting about ${waitTimeInMin} minutes... `);
        else
            miar_log_1.default.info(`Waiting about ${Math.floor(waitTimeInMin / 60)} hours... `);
    });
}
function getAcccessTokenByPasswordAsync(apiKey, apiSecret, scopes, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get access token (THROW)
            const grantType = "password";
            const axiosRes = yield miar_axios_1.default.axiosAsync({
                url: shared.getBaseUrl("public") + "/oauth/token",
                method: "POST",
                headers: {
                    "Content-Type": miar_enum_1.MiarContentType.urlencoded
                },
                data: {
                    grant_type: grantType,
                    client_id: apiKey,
                    client_secret: apiSecret,
                    scope: scopes.join(" "),
                    username: username,
                    password: password
                }
            });
            if (!axiosRes.success)
                throw new miar_error_1.MiarError(axiosRes.data.status, axiosRes.data.message);
            // when any error occured in dailymotion api (THROW)
            else if ("error" in axiosRes.data)
                throw new miar_error_1.MiarError(500, axiosRes.data.error_description);
            return axiosRes.data;
        }
        catch (err) {
            miar_log_1.default.error(`AccessToken - Password - ${err.message}. (username: ${username})`);
            return undefined;
        }
    });
}
function getAcccessTokenByClientCredentialsAsync(apiKey, apiSecret, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // get access token (THROW)
            const grantType = "client_credentials";
            const axiosRes = yield miar_axios_1.default.axiosAsync({
                url: shared.getBaseUrl("private") + "/oauth/v1/token",
                method: "POST",
                headers: {
                    "Content-Type": miar_enum_1.MiarContentType.urlencoded
                },
                data: {
                    grant_type: grantType,
                    client_id: apiKey,
                    client_secret: apiSecret,
                    scope: scopes.join(" ")
                }
            });
            if (!axiosRes.success)
                throw new miar_error_1.MiarError(axiosRes.data.status, axiosRes.data.message);
            // when any error occured in dailymotion api (THROW)
            else if ("error" in axiosRes.data)
                throw new miar_error_1.MiarError(500, axiosRes.data.error_description);
            return axiosRes.data;
        }
        catch (err) {
            miar_log_1.default.error(`AccessToken - Client - ${err.message}`);
            return undefined;
        }
    });
}
function isAccessTokenValidAsync(qName, grantType) {
    return __awaiter(this, void 0, void 0, function* () {
        const qNamesAndTokensOfGrantType = (grantType == "password" ?
            qNamesAndTokens.password
            : qNamesAndTokens.client);
        // when any access token is not exists
        if (!(qName in qNamesAndTokensOfGrantType))
            return false;
        // check expire date
        const nowDateInMs = Date.now();
        const expireDateInMs = qNamesAndTokensOfGrantType[qName].expiresDateInMs;
        const validExpireDateInMs = expireDateInMs - 5000; // early 5 min from real expire date
        return nowDateInMs < validExpireDateInMs;
    });
}
function updateAccessTokenIfRequired(grantType, qName, apiKey, apiSecret, scopes, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield isAccessTokenValidAsync(qName, grantType)))
            switch (grantType) {
                case "password":
                    {
                        // get new token info
                        const accessTokenInfo = yield getAcccessTokenByPasswordAsync(apiKey, apiSecret, scopes, username, password);
                        if (!accessTokenInfo)
                            return false;
                        // add queue to "qNamesAndTokens" if not exists
                        if (!(qName in qNamesAndTokens.password))
                            qNamesAndTokens.password[qName] = {
                                accessToken: "",
                                userId: "",
                                expiresDateInMs: 0
                            };
                        // update old token info
                        qNamesAndTokens.password[qName].accessToken = accessTokenInfo.access_token;
                        qNamesAndTokens.password[qName].userId = accessTokenInfo.uid;
                        qNamesAndTokens.password[qName].expiresDateInMs = (Date.now()
                            + accessTokenInfo.expires_in * 1000);
                    }
                    break;
                case "client_credentials":
                    {
                        // get new token info
                        const accessTokenInfo = yield getAcccessTokenByClientCredentialsAsync(apiKey, apiSecret, scopes);
                        if (!accessTokenInfo)
                            return false;
                        // add queue to "qNamesAndTokens" if not exists
                        if (!(qName in qNamesAndTokens.client))
                            qNamesAndTokens.client[qName] = {
                                accessToken: "",
                                expiresDateInMs: 0
                            };
                        // update old token info
                        qNamesAndTokens.client[qName].accessToken = accessTokenInfo.access_token;
                        qNamesAndTokens.client[qName].expiresDateInMs = (Date.now()
                            + accessTokenInfo.expires_in * 1000);
                    }
                    break;
            }
        return true;
    });
}
//////////////////////// SUB FUNCS - DEACTIVATED ////////////////////////
function publishVideoAsync(keyType, accessToken, videoId, title, description, channel, isCreatedForKids, country, language) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlByKeyType = (keyType == "public" ?
            shared.getBaseUrl(keyType) + "/video/" + videoId
            : shared.getBaseUrl(keyType) + "/rest/video/" + videoId);
        const res = yield miar_axios_1.default.axiosAsync({
            url: urlByKeyType,
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
                tag: ["sport", "news"],
                language: language,
                is_created_for_kids: isCreatedForKids,
                country: country,
            }
        });
        return res;
    });
}
function createVideoAsync(keyType, accessToken, downloadLink, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlByKeyType = (keyType == "public" ?
            shared.getBaseUrl(keyType) + "/user/" + channelId + "/videos"
            : shared.getBaseUrl(keyType) + "/rest/user/" + channelId + "/videos");
        const res = yield miar_axios_1.default.axiosAsync({
            url: urlByKeyType,
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
