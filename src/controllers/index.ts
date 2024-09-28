import miarAxios from "../lib/miar-axios";
import env from "../config/envConfig"
import { MiarErrorModel, MiarResponseModel } from "../lib/miar-model";
import { MiarContentType } from "../lib/miar-enum";
import { AccessTokenResForClient, AccessTokenResForPassword, CreationInfo, PublishInfo }
    from "../models/interfaceModels"
import { Channel, CountryOrLanguage, GrantType, PermissionScope }
    from "../models/typeModels"
import { Request, Response } from "express";
import MiarError from "../lib/miar-error";

const BASE_URL_PRIVATE_KEY = "https://partner.api.dailymotion.com";
const BASE_URL_PUBLIC_KEY = "https://api.dailymotion.com";

/////////////////////////////// EXPORTS //////////////////////////////////
/**
 * Upload video to Dailtmotion with download link.
 */
export async function uploadVideoAsync(req: Request, res: Response) {
    try {
        // get access token
        const tokenRes = await getAccessTokenAsync(
            "password",
            env.API_KEY,
            env.API_SECRET,
            ["userinfo", "manage_videos"],
            env.USERNAME,
            env.PASSWORD);
        if (!tokenRes.success) throw new MiarError(
            (tokenRes.data as MiarErrorModel).status,
            (tokenRes.data as MiarErrorModel).message);

        const tokenInfo = tokenRes.data as AccessTokenResForPassword;
        const userId = tokenInfo.uid;
        const accessToken = tokenInfo.access_token;
        const videoDownloadLink: string = req.body.videoDownloadLink;
        const title: string = req.body.title;
        const description: string = req.body.description;
        const channel: Channel = req.body.channel;
        const isCreatedForKids: boolean = req.body.isCreatedForKids;
        const country: CountryOrLanguage = req.body.country;
        const language: CountryOrLanguage = req.body.language;

        // create the video
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

/////////////////////////////// VALIDATIONS /////////////////////////////////


/////////////////////////////// PRIVATE /////////////////////////////////
/**
* Get access token with "client_credentials" grant type and save token infos
* @returns access token
*/
async function getAccessTokenAsync(
    grantType: "client_credentials",
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[]
): Promise<MiarResponseModel<AccessTokenResForClient | MiarErrorModel>>

/**
* Get access token with "password" grant type and save token infos
* @returns access token
*/
async function getAccessTokenAsync(
    grantType: "password",
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[],
    username: string,
    password: string
): Promise<MiarResponseModel<AccessTokenResForPassword | MiarErrorModel>>

async function getAccessTokenAsync(
    grantType: GrantType,
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[],
    username?: string,
    password?: string
): Promise<any | MiarErrorModel> {
    const res = await miarAxios.axiosAsync({
        url: getBaseUrl() + "/oauth/token",
        method: "POST",
        headers: {
            "Content-Type": MiarContentType.urlencoded
        },
        data: grantType == "client_credentials" ?
            {
                grant_type: "client_credentials",
                client_id: apiKey,
                client_secret: apiSecret,
                scope: scopes.join(" ")
            } : {
                grant_type: "password",
                client_id: apiKey,
                client_secret: apiSecret,
                scope: scopes.join(" "),
                username: username,
                password: password
            }
    });
    if (!res.success) return res;

    return res;
}
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
