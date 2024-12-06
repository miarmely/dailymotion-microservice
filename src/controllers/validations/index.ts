import { NextFunction, Request, Response } from "express";
import miarObj from "../../lib/miar-object";
import {
    validateChannel, validateCountryOrLanguage, validateGrantType, validatePermissionScopes
} from "../../models/typeModels";

export async function uploadVideoByPassword(
    req: Request,
    res: Response,
    next: NextFunction
) {
    { // check values whether missing (RESPONSE)
        const requiredFields = [
            "api_key",
            "api_secret",
            "scopes",
            "username",
            "password",
            "video_download_link",
            "title",
            "description",
            "channel",
            "is_created_for_kids",
            "country",
            "language"
        ];
        const missingFields = miarObj.getKeysNotInObj(requiredFields, req.body);
        if (missingFields.length > 0) {
            res.status(400)
            res.json({
                status: 400,
                success: false,
                message: `Some fields is missing. (required_fields: ${missingFields.join(", ")})`
            })
            return;
        }
    }
    { // check field values whether invalid
        const {
            api_key,
            api_secret,
            scopes,
            username,
            password,
            video_download_link,
            title,
            description,
            channel,
            is_created_for_kids,
            country,
            language
        } = req.body;
        let invalidFields: string[] = [];

        if (typeof api_key != "string") invalidFields.push("api_key");
        if (typeof api_secret != "string") invalidFields.push("api_secret");
        if (!validatePermissionScopes(scopes)) invalidFields.push("scopes");
        if (typeof username != "string") invalidFields.push("username");
        if (typeof password != "string") invalidFields.push("password");
        if (typeof video_download_link != "string") invalidFields.push("video_download_link");
        if (typeof title != "string") invalidFields.push("title");
        if (typeof description != "string") invalidFields.push("description");
        if (typeof is_created_for_kids != "boolean") invalidFields.push("is_created_for_kids");
        if (!validateChannel(channel)) invalidFields.push("channel");
        if (!validateCountryOrLanguage(country)) invalidFields.push("country");
        if (!validateCountryOrLanguage(language)) invalidFields.push("language");

        if (invalidFields.length > 0) {
            res.status(400)
            res.json({
                status: 400,
                success: false,
                message: `Some field values is invalid. (invalid_fields: ${invalidFields.join(", ")})`
            })
            return;
        }
    }

    next();
}
export async function uploadVideoByClientCredentials(
    req: Request,
    res: Response,
    next: NextFunction
) {
    { // check values whether missing (RESPONSE)
        const requiredFields = [
            "api_key",
            "api_secret",
            "scopes",
            "channel_username",
            "video_download_link",
            "title",
            "description",
            "channel",
            "is_created_for_kids",
            "country",
            "language"
        ];
        const missingFields = miarObj.getKeysNotInObj(requiredFields, req.body);
        if (missingFields.length > 0) {
            res.status(400)
            res.json({
                status: 400,
                success: false,
                message: `Some fields is missing. (required_fields: ${missingFields.join(", ")})`
            })
            return;
        }
    }
    { // check field values whether invalid
        const {
            api_key,
            api_secret,
            scopes,
            channel_username,
            video_download_link,
            title,
            description,
            channel,
            is_created_for_kids,
            country,
            language
        } = req.body;
        let invalidFields: string[] = [];

        if (typeof api_key != "string") invalidFields.push("api_key");
        if (typeof api_secret != "string") invalidFields.push("api_secret");
        if (!validatePermissionScopes(scopes)) invalidFields.push("scopes");
        if (typeof channel_username != "string") invalidFields.push("channel_username");
        if (typeof video_download_link != "string") invalidFields.push("video_download_link");
        if (typeof title != "string") invalidFields.push("title");
        if (typeof description != "string") invalidFields.push("description");
        if (typeof is_created_for_kids != "boolean") invalidFields.push("is_created_for_kids");
        if (!validateChannel(channel)) invalidFields.push("channel");
        if (!validateCountryOrLanguage(country)) invalidFields.push("country");
        if (!validateCountryOrLanguage(language)) invalidFields.push("language");

        if (invalidFields.length > 0) {
            res.status(400)
            res.json({
                status: 400,
                success: false,
                message: `Some field values is invalid. (invalid_fields: ${invalidFields.join(", ")})`
            })
            return;
        }
    }

    next();
}