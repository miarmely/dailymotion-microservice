"use strict";
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
const miar_object_1 = __importDefault(require("../../lib/miar-object"));
const typeModels_1 = require("../../models/typeModels");
function uploadVideo(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        { // check values whether missing (RESPONSE)
            const requiredFields = [
                "access_token",
                "user_id",
                "video_download_link",
                "title",
                "description",
                "channel",
                "is_created_for_kids",
                "country",
                "language"
            ];
            const missingFields = miar_object_1.default.getKeysNotInObj(requiredFields, req.body);
            if (missingFields.length > 0) {
                res.status(400);
                res.json({
                    status: 400,
                    success: false,
                    message: `Some fields is missing. (required_fields: ${missingFields.join(", ")})`
                });
                return;
            }
        }
        { // check field values whether invalid
            const { access_token, user_id, video_download_link, title, description, channel, is_created_for_kids, country, language } = req.body;
            let invalidFields = [];
            if (typeof access_token != "string")
                invalidFields.push("access_token");
            if (typeof user_id != "string")
                invalidFields.push("user_id");
            if (typeof video_download_link != "string")
                invalidFields.push("video_download_link");
            if (typeof title != "string")
                invalidFields.push("title");
            if (typeof description != "string")
                invalidFields.push("description");
            if (typeof is_created_for_kids != "boolean")
                invalidFields.push("is_created_for_kids");
            if (!(0, typeModels_1.validateChannel)(channel))
                invalidFields.push("channel");
            if (!(0, typeModels_1.validateCountryOrLanguage)(country))
                invalidFields.push("country");
            if (!(0, typeModels_1.validateCountryOrLanguage)(language))
                invalidFields.push("language");
            if (invalidFields.length > 0) {
                res.status(400);
                res.json({
                    status: 400,
                    success: false,
                    message: `Some field values is invalid. (invalid_fields: ${invalidFields.join(", ")})`
                });
                return;
            }
        }
        next();
    });
}
function getAccessTokenByPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        { // check values whether missing (RESPONSE)
            const requiredFields = [
                "api_key",
                "api_secret",
                "scopes",
                "username",
                "password"
            ];
            const missingFields = miar_object_1.default.getKeysNotInObj(requiredFields, req.body);
            if (missingFields.length > 0) {
                res.status(400);
                res.json({
                    status: 400,
                    success: false,
                    message: `Some fields is missing. (required_fields: ${missingFields.join(", ")})`
                });
                return;
            }
        }
        { // check values whether invalid (RESPONSE)
            const { api_key, api_secret, scopes, username, password } = req.body;
            let invalidFields = [];
            if (typeof api_key != "string")
                invalidFields.push("api_key");
            if (typeof api_secret != "string")
                invalidFields.push("api_secret");
            if (!(0, typeModels_1.validatePermissionScopes)(scopes))
                invalidFields.push("scopes");
            if (typeof username != "string")
                invalidFields.push("username");
            if (typeof password != "string")
                invalidFields.push("password");
            if (invalidFields.length > 0) {
                res.status(400);
                res.json({
                    status: 400,
                    success: false,
                    message: `Some field values is invalid. (invalid_fields: ${invalidFields.join(", ")})`
                });
                return;
            }
        }
        next();
    });
}
function getAccessTokenByClientCredentials(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        { // check values whether missing (RESPONSE)
            const requiredFields = [
                "api_key",
                "api_secret",
                "scopes"
            ];
            const missingFields = miar_object_1.default.getKeysNotInObj(requiredFields, req.body);
            if (missingFields.length > 0) {
                res.status(400);
                res.json({
                    status: 400,
                    success: false,
                    message: `Some fields is missing. (required_fields: ${missingFields.join(", ")})`
                });
                return;
            }
        }
        { // check values whether invalid (RESPONSE)
            const { api_key, api_secret, scopes } = req.body;
            let invalidFields = [];
            if (typeof api_key != "string")
                invalidFields.push("api_key");
            if (typeof api_secret != "string")
                invalidFields.push("api_secret");
            if (!(0, typeModels_1.validatePermissionScopes)(scopes))
                invalidFields.push("scopes");
            if (invalidFields.length > 0) {
                res.status(400);
                res.json({
                    status: 400,
                    success: false,
                    message: `Some field values is invalid. (invalid_fields: ${invalidFields.join(", ")})`
                });
                return;
            }
        }
        next();
    });
}
