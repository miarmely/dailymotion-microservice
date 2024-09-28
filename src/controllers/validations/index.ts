import { NextFunction, Request, Response } from "express";
import { validateChannel, validateCountryOrLanguage } from "../../models/typeModels";

export async function uploadVideoAsync(req: Request, res: Response, next: NextFunction) {
    const requiredFields = [
        "userId",
        "videoDownloadLink",
        "title",
        "description",
        "channel",
        "isCreatedForKids",
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
        userId,
        videoDownloadLink,
        title,
        description,
        channel,
        isCreatedForKids,
        country,
        language
    } = req.body;
    if (typeof userId != "string") invalidFields.push("userId");
    if (typeof videoDownloadLink != "string") invalidFields.push("videoDownloadLink");
    if (typeof title != "string") invalidFields.push("title");
    if (typeof description != "string") invalidFields.push("description");
    if (typeof isCreatedForKids != "boolean") invalidFields.push("isCreatedForKids");
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