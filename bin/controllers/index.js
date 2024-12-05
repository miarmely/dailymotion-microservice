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
exports.uploadVideoByPassword = uploadVideoByPassword;
exports.uploadVideoByClientCredentials = uploadVideoByClientCredentials;
const miar_log_1 = __importDefault(require("../lib/miar-log"));
const shared = __importStar(require("./workers/index/sharedResources"));
/**
 * Upload video to Dailymotion by "Public Key" via "password" grant type.
 */
function uploadVideoByPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        { // add request to queue
            var videoTitle = req.body.title;
            var videoTitleForLog = (videoTitle.length <= 50 ?
                videoTitle
                : videoTitle.substring(0, 40) + "...");
            const isSuccess = yield shared.miarMq.sendMessageToQueueAsync(shared.queueNames.UPLOAD_VIDEO_BY_PASS, req.body);
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
 * Upload video to Dailymotion by "Private Key" via "client credentials" grant type.
 */
function uploadVideoByClientCredentials(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        { // add request to queue
            var videoTitle = req.body.title;
            var videoTitleForLog = (videoTitle.length <= 50 ?
                videoTitle
                : videoTitle.substring(0, 40) + "...");
            const isSuccess = yield shared.miarMq.sendMessageToQueueAsync(shared.queueNames.UPLOAD_VIDEO_BY_CLIENT, req.body);
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
