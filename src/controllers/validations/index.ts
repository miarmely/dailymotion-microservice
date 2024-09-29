import { NextFunction, Request, Response } from "express";
import { validateChannel, validateCountryOrLanguage } from "../../models/typeModels";

export async function uploadVideoAsync(req: Request, res: Response, next: NextFunction) {
    const requiredFields = [
        "api_key",
        "api_secret",
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
    let undefinedFields = [];
    let invalidFields = [];

    // check values whether undefined
    for (const requiredField of requiredFields)
        if (!(requiredField in req.body)) undefinedFields.push(requiredField);

    // when any required fields is undefined (RESPONSE)
    if (undefinedFields.length > 0) {
        res.status(400)
        res.json({
            status: 400,
            success: false,
            message: `Some fields is not entered. (required_fields: ${undefinedFields.join(", ")})`
        })
        return;
    }

    // check field values 
    const {
        api_key,
        api_secret,
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
    if (typeof api_key != "string") invalidFields.push("api_key");
    if (typeof api_secret != "string") invalidFields.push("api_secret");
    if (typeof username != "string") invalidFields.push("username");
    if (typeof password != "string") invalidFields.push("password");
    if (typeof video_download_link != "string") invalidFields.push("video_download_link");
    if (typeof title != "string") invalidFields.push("title");
    if (typeof description != "string") invalidFields.push("description");
    if (typeof is_created_for_kids != "boolean") invalidFields.push("is_created_for_kids");
    if (!validateChannel(channel)) invalidFields.push("channel");
    if (!validateCountryOrLanguage(country)) invalidFields.push("country");
    if (!validateCountryOrLanguage(language)) invalidFields.push("language");

    // when value of any field is invalid (RESPONSE)
    if (invalidFields.length > 0) {
        res.status(400)
        res.json({
            status: 400,
            success: false,
            message: `Some field values is invalid. (invalid_fields: ${invalidFields.join(", ")})`
        })
        return;
    }

    next();
}