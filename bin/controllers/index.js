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
exports.getAccessTokenByPassword = getAccessTokenByPassword;
exports.getAccessTokenByClientCredentials = getAccessTokenByClientCredentials;
const miar_log_1 = __importDefault(require("../lib/miar-log"));
const miar_axios_1 = __importDefault(require("../lib/miar-axios"));
const miar_error_1 = require("../lib/miar-error");
const miar_enum_1 = require("../lib/miar-enum");
const shared = __importStar(require("./workers/index/sharedResources"));
/**
 * Upload video to Dailtmotion with download link.
 */
function uploadVideo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        { // add request to queue
            var videoTitle = req.body.title;
            var videoTitleForLog = (videoTitle.length <= 50 ?
                videoTitle
                : videoTitle.substring(0, 40) + "...");
            const isSuccess = yield shared.miarMq.sendMessageToQueueAsync(shared.queueNames.UPLOAD_VIDEO, req.body);
            if (!isSuccess) {
                miar_log_1.default.error("Queue - Message couldn't upload to queue. " +
                    `video_title: ${videoTitleForLog}`);
                res.status(500);
                res.json({ status: 500, success: false });
                return;
            }
        }
        { // save log and give response
            miar_log_1.default.info(`Message added to queue. (video_title: ${videoTitleForLog})`);
            res.status(200);
            res.json({ status: 200, success: true });
        }
    });
}
/**
 * Get access token with "password" grant type
 */
function getAccessTokenByPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const grantType = "password";
        const apiKey = req.body.api_key;
        const apiSecret = req.body.api_secret;
        const scopes = req.body.scopes;
        const username = req.body.username;
        const password = req.body.password;
        try {
            // get access token (THROW)
            const axiosRes = yield miar_axios_1.default.axiosAsync({
                url: shared.getBaseUrl() + "/oauth/token",
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
            res.status(200);
            res.json({
                status: 200,
                success: true,
                data: axiosRes.data
            });
        }
        catch (err) {
            miar_log_1.default.error(`Access Token - ${err.message}. (username: ${username})`);
            res.status(err.status);
            res.json({ status: err.status, success: false });
        }
    });
}
/**
 * Get access token with "client_credentials" grant type
 */
function getAccessTokenByClientCredentials(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const grantType = "client_credentials";
        const apiKey = req.body.api_key;
        const apiSecret = req.body.api_secret;
        const scopes = req.body.scopes;
        try {
            // get access token (THROW)
            const axiosRes = yield miar_axios_1.default.axiosAsync({
                url: shared.getBaseUrl() + "/oauth/token",
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
            res.status(200);
            res.json({
                status: 200,
                success: true,
                data: axiosRes.data
            });
        }
        catch (err) {
            res.status(err.status);
            res.json({
                status: err.status,
                success: false,
                message: err.message
            });
        }
    });
}
