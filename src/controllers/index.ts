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
export async function uploadVideoAsync(req: Request, res: Response) {
    try {
        const apiSecret: string = req.body.api_secret;
        const apiKey: string = req.body.api_key;
        const username: string = req.body.username;
        const password: string = req.body.password;
        const videoDownloadLink: string = req.body.video_download_link;
        const title: string = req.body.title;
        const description: string = req.body.description;
        const channel: Channel = req.body.channel;
        const isCreatedForKids: boolean = req.body.is_created_for_kids;
        const country: CountryOrLanguage = req.body.country;
        const language: CountryOrLanguage = req.body.language;

        // get access token
        const tokenRes = await getAccessTokenAsync(
            "password",
            apiKey,
            apiSecret,
            ["userinfo", "manage_videos"],
            username,
            password);
        if (!tokenRes.success) throw new MiarError(
            (tokenRes.data as MiarErrorModel).status,
            (tokenRes.data as MiarErrorModel).message);

        // create the video
        const tokenData = tokenRes.data as AccessTokenResForPassword;
        const userId: string = tokenData.uid;
        const accessToken: string = tokenData.access_token;
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
    const axiosRes = await miarAxios.axiosAsync({
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
    if (!axiosRes.success) return axiosRes as MiarResponseModel<MiarErrorModel>;

    // when any error occured in dailymotion services
    else if ("error" in axiosRes.data) return miarModel.setResponseModel(
        false,
        miarModel.setErrorModel(500, axiosRes.data.error, axiosRes.data.error_description));

    return axiosRes as MiarResponseModel<any>;
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
