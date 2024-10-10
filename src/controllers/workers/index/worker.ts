import miarTime from "../../../lib/miar-time"
import miarLog from "../../../lib/miar-log";
import miarAxios from "../../../lib/miar-axios";
import { MiarError } from "../../../lib/miar-error";
import { MiarContentType } from "../../../lib/miar-enum";
import { MiarErrorModel, MiarResponseModel } from "../../../lib/miar-model";

import * as shared from "./sharedResources"
import { AccessTokenResForClient, AccessTokenResForPassword, CreationInfo, PublishInfo } from "../../../models/interfaceModels"
import { Channel, CountryOrLanguage, GrantType, KeyType, PermissionScope } from "../../../models/typeModels"

const qNamesAndTokens: {
    password: {
        [queueName: string]: {
            accessToken: string,
            expiresDateInMs: number,
            userId: string
        }
    },
    client: {
        [queueName: string]: {
            accessToken: string,
            expiresDateInMs: number
        }
    },
} = { password: {}, client: {} };

////////////////// MAIN FUNCS //////////////////
/**
 * Upload video to Dailymotion by "password" grant type per "5 minute".
 */
export async function uploadVideoByPasswordAsync() {
    try {
        const qName = shared.queueNames.UPLOAD_VIDEO_BY_PASS;

        await shared.miarMq.connectAsync();
        await shared.miarMq.channel?.assertQueue(qName, { durable: true });
        await shared.miarMq.channel?.prefetch(1);  // process only one message at same time
        await shared.miarMq.channel?.consume(qName, async (msg) => {
            // when queue is empty
            if (!msg) {
                miarLog.info("Queue is empty.")
                return;
            };

            { // consume queue
                let body: any;
                try {
                    body = JSON.parse(msg.content.toString());
                    const apiKey: string = body.api_key;
                    const apiSecret: string = body.api_secret;
                    const scopes: PermissionScope[] = body.scopes;
                    const username: string = body.username;
                    const password: string = body.password;
                    const videoDownloadLink: string = body.video_download_link;
                    const description: string = body.description;
                    const channel: Channel = body.channel;
                    const isCreatedForKids: boolean = body.is_created_for_kids;
                    const country: CountryOrLanguage = body.country;
                    const language: CountryOrLanguage = body.language;
                    const videoTitle = body.title;

                    // update access token if expired or invalid
                    const isSuccess = await updateAccessTokenIfRequired(
                        "password",
                        qName,
                        apiKey,
                        apiSecret,
                        scopes,
                        username,
                        password
                    );
                    if (!isSuccess) throw new MiarError(5000, "");

                    // create video on dailymotion
                    const tokenInfo = qNamesAndTokens.password[qName];
                    const creationRes = await createVideoAsync(
                        "public",
                        tokenInfo.accessToken,
                        tokenInfo.userId,
                        videoDownloadLink);
                    if (!creationRes.success) throw new MiarError(
                        5001,
                        (creationRes.data as MiarErrorModel).message);

                    // publish video on dailymotion
                    const videoId = (creationRes.data as CreationInfo).id;
                    const publishRes = await publishVideoAsync(
                        "public",
                        tokenInfo.accessToken,
                        videoId,  // video id
                        videoTitle,
                        description,
                        channel,
                        isCreatedForKids,
                        country,
                        language
                    );
                    if (!publishRes.success) throw new MiarError(
                        5002,
                        (publishRes.data as MiarErrorModel).message);
                    const publishInfo = publishRes.data as PublishInfo;

                    // save log
                    const croppedVideoTitle = (videoTitle.length <= 30 ?
                        videoTitle
                        : videoTitle.substring(0, 30) + "..."
                    );
                    miarLog.info("Video is uploaded to dailymotion. " +
                        `(video_id: ${videoId}) ` +
                        `(video_title: ${croppedVideoTitle})`
                    );

                    await waitBeforePassNextMessageAsync(5);
                    shared.miarMq.channel?.ack(msg);
                }
                catch (err: any) {
                    // save log
                    const miarErr: MiarError = err;
                    miarLog.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${miarErr.message})`, body);

                    // wait before sending request again
                    switch (miarErr.status) {
                        case 5000:  // Access Token Error
                            await waitBeforePassNextMessageAsync(2);
                            break;
                        case 5001:  // Creation Error
                            await waitBeforePassNextMessageAsync(30);
                            break;
                        case 5002:  // Publishing Error 
                            await waitBeforePassNextMessageAsync(30);
                            break;
                    }

                    shared.miarMq.channel?.nack(msg, false, true);
                }
            }
        });
    } catch (err: any) {
        const error: MiarError = err;
        miarLog.error(`General - Worker of "uploadVideo" didn't executed. ` +
            `(error_message: ${error.message})`);
    }
}
/**
 * Upload video to Dailymotion by "client credentials" grant type per "5 minute".
 */
export async function uploadVideoByClientCredentialsAsync() {
    try {
        const qName = shared.queueNames.UPLOAD_VIDEO_BY_PASS;

        await shared.miarMq.connectAsync();
        await shared.miarMq.channel?.assertQueue(qName, { durable: true });
        await shared.miarMq.channel?.prefetch(1);  // process only one message at same time
        await shared.miarMq.channel?.consume(qName, async (msg) => {
            // when queue is empty
            if (!msg) return;

            { // consume queue
                let body: any;
                try {
                    body = JSON.parse(msg.content.toString());
                    const accessToken: string = body.access_token;
                    const userId: string = body.user_id;
                    const videoDownloadLink: string = body.video_download_link;
                    const description: string = body.description;
                    const channel: Channel = body.channel;
                    const isCreatedForKids: boolean = body.is_created_for_kids;
                    const country: CountryOrLanguage = body.country;
                    const language: CountryOrLanguage = body.language;
                    const videoTitle = body.title;

                    // create video on dailymotion
                    var creationRes = await createVideoAsync("private", accessToken, userId, videoDownloadLink);
                    if (!creationRes.success) throw new MiarError(
                        (creationRes.data as MiarErrorModel).status,
                        (creationRes.data as MiarErrorModel).message);

                    // publish video on dailymotion
                    const videoId = (creationRes.data as CreationInfo).id;
                    const publishRes = await publishVideoAsync(
                        "private",
                        accessToken,
                        videoId,  // video id
                        videoTitle,
                        description,
                        channel,
                        isCreatedForKids,
                        country,
                        language
                    );
                    if (!publishRes.success) throw new MiarError(
                        (publishRes.data as MiarErrorModel).status,
                        (publishRes.data as MiarErrorModel).message);
                    const publishInfo = publishRes.data as PublishInfo;

                    // save log
                    const croppedVideoTitle = (videoTitle.length <= 30 ?
                        videoTitle
                        : videoTitle.substring(0, 30) + "..."
                    );
                    miarLog.info("Video is uploaded to dailymotion. " +
                        `(video_id: ${videoId}) ` +
                        `(video_title: ${croppedVideoTitle})`
                    );

                    await waitBeforePassNextMessageAsync(5);
                    shared.miarMq.channel?.ack(msg);
                }
                catch (err: any) {
                    // save log
                    const error: MiarError = err;
                    miarLog.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${error.message})`, body);

                    await waitBeforePassNextMessageAsync(30);
                    shared.miarMq.channel?.nack(msg, false, true);
                }
            }
        });
    } catch (err: any) {
        const error: MiarError = err;
        miarLog.error(`General - Worker of "uploadVideo" didn't executed. ` +
            `(error_message: ${error.message})`);
    }
}

////////////////// SUB-FUNCS //////////////////
async function createVideoAsync(
    keyType: KeyType,
    accessToken: string,
    userId: string,
    downloadLink: string
) {
    const res = await miarAxios.axiosAsync({
        url: `${shared.getBaseUrl(keyType)}/user/${userId}/videos`,
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
    keyType: KeyType,
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
        url: shared.getBaseUrl(keyType) + "/video/" + videoId,
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
            tag: ["news", "sport"],
            //thumbnail_url: videoPosterPath,
            language: language,
            is_created_for_kids: isCreatedForKids,
            country: country,


        }
    });

    return res as MiarResponseModel<PublishInfo | MiarErrorModel>;
}
async function waitBeforePassNextMessageAsync(waitTimeInMin: number) {
    miarLog.info(`Waiting about ${waitTimeInMin} minute...`);

    const waitTimeInMs = waitTimeInMin * 60 * 1000;
    await miarTime.sleepAsync(waitTimeInMs);
}
async function getAcccessTokenByPasswordAsync(
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[],
    username: string,
    password: string
) {
    try {
        // get access token (THROW)
        const grantType: GrantType = "password";
        const axiosRes = await miarAxios.axiosAsync({
            url: shared.getBaseUrl("public") + "/oauth/token",
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

        return axiosRes.data as AccessTokenResForPassword;
    } catch (err: any) {
        miarLog.error(`Access Token - ${err.message}. (username: ${username})`);
        return undefined;
    }
}
async function getAcccessTokenByClientCredentialsAsync(
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[]
) {
    const grantType: GrantType = "client_credentials";

}
async function isAccessTokenValidAsync(qName: string, grantType: GrantType) {
    // when any access token is not exists
    if (!(qName in qNamesAndTokens)) return false;
    // check expire date
    const nowDateInMs = Date.now();
    const expireDateInMs = (grantType == "password" ?
        qNamesAndTokens.password[qName].expiresDateInMs
        : qNamesAndTokens.client[qName].expiresDateInMs
    );
    const validExpireDateInMs = expireDateInMs - 5000;  // early 5 min from real expire date

    return nowDateInMs < validExpireDateInMs;
}

/**
 * By "password" grant type.
 */
async function updateAccessTokenIfRequired(
    grantType: "password",
    qName: string,
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[],
    username: string,
    password: string
): Promise<Boolean>;
/**
 * By "client_credentials" grant type.
 */
async function updateAccessTokenIfRequired(
    grantType: "client_credentials",
    qName: string,
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[],
): Promise<Boolean>;
async function updateAccessTokenIfRequired(
    grantType: GrantType,
    qName: string,
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[],
    username?: any,
    password?: any
) {
    if (!await isAccessTokenValidAsync(qName, grantType)) {
        switch (grantType) {
            case "password":
                // get new token info
                var accessTokenInfo = await getAcccessTokenByPasswordAsync(
                    apiKey,
                    apiSecret,
                    scopes,
                    username,
                    password
                );
                if (!accessTokenInfo) return false;

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
                    + accessTokenInfo.expires_in * 1000
                );

                break;
            case "client_credentials":
                // // update access token
                // var accessTokenInfo = await getAcccessTokenByClientCredentialsAsync(
                //     apiKey,
                //     apiSecret,
                //     scopes
                // );
                // if (!accessTokenInfo) return false;
                // qNamesAndTokens.password[qName] = accessTokenInfo;

                break;
        }
    }

    return true;
}