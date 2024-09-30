import { Request, Response } from "express";

import miarAxios from "../lib/miar-axios";
import MiarError from "../lib/miar-error";
import miarModel, { MiarErrorModel, MiarResponseModel } from "../lib/miar-model";
import { MiarContentType } from "../lib/miar-enum";

import env from "../config/envConfig"
import { AccessTokenResForClient, AccessTokenResForPassword, CreationInfo, PublishInfo }
    from "../models/interfaceModels"
import { Channel, CountryOrLanguage, GrantType, PermissionScope }
    from "../models/typeModels"

const BASE_URL_PRIVATE_KEY = "https://partner.api.dailymotion.com";
const BASE_URL_PUBLIC_KEY = "https://api.dailymotion.com";

/////////////////////////////// EXPORTS //////////////////////////////////
/**
 * Upload video to Dailtmotion with download link.
 */
export async function uploadVideo(req: Request, res: Response) {
    try {
        //const apiSecret: string = req.body.api_secret;
        //const apiKey: string = req.body.api_key;
        //const username: string = req.body.username;
        //const password: string = req.body.password;
        const accessToken: string = req.body.access_token;
        const userId: string = req.body.user_id;
        const videoDownloadLink: string = req.body.video_download_link;
        const title: string = req.body.title;
        const description: string = req.body.description;
        const channel: Channel = req.body.channel;
        const isCreatedForKids: boolean = req.body.is_created_for_kids;
        const country: CountryOrLanguage = req.body.country;
        const language: CountryOrLanguage = req.body.language;

        // // get access token
        // const tokenRes = await getAccessTokenAsync(
        //     "password",
        //     apiKey,
        //     apiSecret,
        //     ["userinfo", "manage_videos"],
        //     username,
        //     password);
        // if (!tokenRes.success) throw new MiarError(
        //     (tokenRes.data as MiarErrorModel).status,
        //     (tokenRes.data as MiarErrorModel).message);
        // const tokenData = tokenRes.data as AccessTokenResForPassword;

        const creationRes = await createVideoAsync(accessToken, userId, videoDownloadLink);
        if (!creationRes.success) throw new MiarError(
            (creationRes.data as MiarErrorModel).status,
            (creationRes.data as MiarErrorModel).message);

        // publish the video
        const videoId = (creationRes.data as CreationInfo).id;
        const publishRes = await publishVideoAsync(
            accessToken,
            videoId,  // video id
            title,
            description,
            channel,
            isCreatedForKids,
            country,
            language);
        if (!publishRes.success) throw new MiarError(
            (publishRes.data as MiarErrorModel).status,
            (publishRes.data as MiarErrorModel).message);

        res.status(200);
        res.json({
            success: true,
            publishInfo: publishRes.data as PublishInfo
        });
    }
    catch (err: any) {
        res.status(err.status);
        res.json({
            success: false,
            status: err.status,
            message: err.message
        });
    }
}
/**
 * Get access token with "password" grant type
 */
export async function getAccessTokenByPassword(
    req: Request,
    res: Response,
) {
    const grantType: GrantType = "password";
    const apiKey: string = req.body.api_key;
    const apiSecret: string = req.body.api_secret;
    const scopes: PermissionScope[] = req.body.scopes;
    const username: string | undefined = req.body.username;
    const password: string | undefined = req.body.password;

    try {
        // get access token (THROW)
        const axiosRes = await miarAxios.axiosAsync({
            url: getBaseUrl() + "/oauth/token",
            method: "POST",
            headers: {
                "Content-Type": MiarContentType.urlencoded
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
        if (!axiosRes.success) throw new MiarError(
            (axiosRes.data as MiarErrorModel).status,
            (axiosRes.data as MiarErrorModel).message);

        // when any error occured in dailymotion api (THROW)
        else if ("error" in axiosRes.data) throw new MiarError(
            500,
            axiosRes.data.error_description);

        res.status(200);
        res.json({
            status: 200,
            success: true,
            data: axiosRes.data
        });

    } catch (err: any) {
        res.status(err.status);
        res.json({
            status: err.status,
            success: false,
            message: err.message
        });
    }
}
/**
 * Get access token with "client_credentials" grant type
 */
export async function getAccessTokenByClientCredentials(
    req: Request,
    res: Response,
) {
    const grantType: GrantType = "client_credentials";
    const apiKey: string = req.body.api_key;
    const apiSecret: string = req.body.api_secret;
    const scopes: PermissionScope[] = req.body.scopes;

    try {
        // get access token (THROW)
        const axiosRes = await miarAxios.axiosAsync({
            url: getBaseUrl() + "/oauth/token",
            method: "POST",
            headers: {
                "Content-Type": MiarContentType.urlencoded
            },
            data: {
                grant_type: grantType,
                client_id: apiKey,
                client_secret: apiSecret,
                scope: scopes.join(" ")
            }
        });
        if (!axiosRes.success) throw new MiarError(
            (axiosRes.data as MiarErrorModel).status,
            (axiosRes.data as MiarErrorModel).message);

        // when any error occured in dailymotion api (THROW)
        else if ("error" in axiosRes.data) throw new MiarError(
            500,
            axiosRes.data.error_description);

        res.status(200);
        res.json({
            status: 200,
            success: true,
            data: axiosRes.data
        });

    } catch (err: any) {
        res.status(err.status);
        res.json({
            status: err.status,
            success: false,
            message: err.message
        });
    }
}

/////////////////////////////// PRIVATE /////////////////////////////////
async function createVideoAsync(
    accessToken: string,
    userId: string,
    downloadLink: string
) {
    const res = await miarAxios.axiosAsync({
        url: `${getBaseUrl()}/user/${userId}/videos`,
        method: "POST",
        headers: {
            "Content-Type": MiarContentType.urlencoded,
            Authorization: "Bearer " + accessToken,
        },
        data: { url: downloadLink }
    });

    return res as MiarResponseModel<CreationInfo | MiarErrorModel>;
}
async function publishVideoAsync(
    accessToken: string,
    videoId: string,
    title: string,
    description: string,
    channel: Channel,
    isCreatedForKids: boolean,
    country: CountryOrLanguage,
    language: CountryOrLanguage
) {
    const res = await miarAxios.axiosAsync({
        url: getBaseUrl() + "/video/" + videoId,
        method: "POST",
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": MiarContentType.urlencoded,
        },
        data: {
            published: true,
            title: title,
            description: description,
            channel: channel,
            is_created_for_kids: isCreatedForKids,
            country: country,
            language: language,
        }
    });

    return res as MiarResponseModel<PublishInfo | MiarErrorModel>;
}
function getBaseUrl() {
    return env.KEY_TYPE == "public" ?
        BASE_URL_PUBLIC_KEY
        : BASE_URL_PRIVATE_KEY;
}
