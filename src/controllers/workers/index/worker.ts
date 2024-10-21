import miarLog from "../../../lib/miar-log";
import miarAxios from "../../../lib/miar-axios";
import { MiarError } from "../../../lib/miar-error";
import { MiarContentType } from "../../../lib/miar-enum";
import { MiarErrorModel, MiarResponseModel } from "../../../lib/miar-model";

import env from "../../../config/envConfig"
import * as shared from "./sharedResources"
import {
    AccessTokenResForClient, AccessTokenResForPassword, CreationAndPublishResponse, CreationResponse,
    PublishResponse
} from "../../../models/interfaceModels"
import {
    Channel, CountryOrLanguage, GrantType, KeyType, PermissionScope
} from "../../../models/typeModels"

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

//////////////////////// MAIN FUNCS ////////////////////////
/**
 * Upload video to Dailymotion by "password" grant type per "5 minute".
 */
export async function uploadVideoByPasswordAsync() {
    try {
        const qName = shared.queueNames.UPLOAD_VIDEO_BY_PASS;

        await shared.miarMq.connectAsync();
        await shared.miarMq.channel?.assertQueue(qName, { durable: true });
        await shared.miarMq.channel?.prefetch(1);  // process only one msg at same time
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
                    const downloadLink: string = body.video_download_link;
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

                    // upload video
                    const tokenInfo = qNamesAndTokens.password[qName];
                    const creationAndPublishRes = await createAndPublishVideoAsync(
                        "public",
                        tokenInfo.accessToken,
                        tokenInfo.userId,
                        downloadLink,
                        channel,
                        videoTitle,
                        description,
                        isCreatedForKids,
                        country,
                        language
                    );
                    if (!creationAndPublishRes.success) throw new MiarError(
                        5001,
                        (creationAndPublishRes.data as MiarErrorModel).message);

                    // save log
                    const data = creationAndPublishRes.data as CreationAndPublishResponse;
                    const croppedVideoTitle = (videoTitle.length <= 30 ?
                        videoTitle
                        : videoTitle.substring(0, 30) + "..."
                    );
                    miarLog.info("Video is uploaded to dailymotion. " +
                        `(username: ${username}) ` +
                        `(video_id: ${data.id}) ` +
                        `(video_title: ${croppedVideoTitle})`
                    );

                    // wait about "30 sec"
                    shared.miarMq.channel?.ack(msg);
                    await stopConsumingUntilSpecificTimeAsync(
                        env.waitTime.UPLOAD_BY_PASS_IN_MIN,
                        uploadVideoByPasswordAsync
                    );
                }
                catch (err: any) {
                    // save log
                    const miarErr: MiarError = err;
                    miarLog.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${miarErr.message})`, body);

                    shared.miarMq.channel?.nack(msg, false, true);

                    // start queue consuming again after "waitTime"
                    switch (miarErr.status) {
                        case 5000:  // Access Token Error
                            await stopConsumingUntilSpecificTimeAsync(
                                2,
                                uploadVideoByPasswordAsync
                            );
                            break;
                        case 5001:  // Upload Error
                            await stopConsumingUntilSpecificTimeAsync(
                                24 * 60,  // 24 hour
                                uploadVideoByPasswordAsync
                            );
                            break;
                    }
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
        const qName = shared.queueNames.UPLOAD_VIDEO_BY_CLIENT;

        await shared.miarMq.connectAsync();
        await shared.miarMq.channel?.assertQueue(qName, { durable: true });
        await shared.miarMq.channel?.prefetch(1);  // process only one msg at same time
        await shared.miarMq.channel?.consume(qName, async (msg) => {
            // when queue is empty
            if (!msg) return;

            { // consume queue
                let body: any;
                try {
                    body = JSON.parse(msg.content.toString());
                    const apiKey: string = body.api_key;
                    const apiSecret: string = body.api_secret;
                    const scopes: PermissionScope[] = body.scopes;
                    const channelUsername: string = body.channel_username;
                    const downloadLink: string = body.video_download_link;
                    const title: string = body.title;
                    const description: string = body.description;
                    const channel: Channel = body.channel;
                    const isCreatedForKids: boolean = body.is_created_for_kids;
                    const country: CountryOrLanguage = body.country;
                    const language: CountryOrLanguage = body.language;

                    // update access token if expired or invalid
                    const isSuccess = await updateAccessTokenIfRequired(
                        "client_credentials",
                        qName,
                        apiKey,
                        apiSecret,
                        scopes
                    );
                    if (!isSuccess) throw new MiarError(5000, "");

                    // upload video
                    const tokenInfo = qNamesAndTokens.client[qName];
                    const creationAndPublishRes = await createAndPublishVideoAsync(
                        "private",
                        tokenInfo.accessToken,
                        channelUsername,
                        downloadLink,
                        channel,
                        title,
                        description,
                        isCreatedForKids,
                        country,
                        language
                    );
                    if (!creationAndPublishRes.success) throw new MiarError(
                        5001,
                        (creationAndPublishRes.data as MiarErrorModel).message);

                    // save log
                    const data = creationAndPublishRes.data as CreationAndPublishResponse;
                    const croppedVideoTitle = (title.length <= 30 ?
                        title
                        : title.substring(0, 30) + "..."
                    );
                    miarLog.info("Video is uploaded to dailymotion. " +
                        `(channel_username: ${channelUsername}) ` +
                        `(video_id: ${data.id}) ` +
                        `(video_title: ${croppedVideoTitle})`
                    );

                    // wait about 1 min
                    shared.miarMq.channel?.ack(msg);
                    await stopConsumingUntilSpecificTimeAsync(
                        env.waitTime.UPLOAD_BY_CLIENT_IN_MIN,
                        uploadVideoByClientCredentialsAsync
                    );
                }
                catch (err: any) {
                    // save log
                    const miarErr: MiarError = err;
                    miarLog.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${miarErr.message})`, body);

                    shared.miarMq.channel?.nack(msg, false, true);

                    // wait before send request again
                    switch (miarErr.status) {
                        case 5000:  // Access Token Error
                            await stopConsumingUntilSpecificTimeAsync(
                                2,
                                uploadVideoByClientCredentialsAsync
                            );
                            break;
                        case 5001:  // Upload Error
                            await stopConsumingUntilSpecificTimeAsync(
                                24 * 60, // 24 hours
                                uploadVideoByClientCredentialsAsync
                            );
                            break;
                            await stopConsumingUntilSpecificTimeAsync(
                                24 * 60, // 24 hours
                                uploadVideoByClientCredentialsAsync
                            );
                            break;
                    }
                }
            }
        });
    } catch (err: any) {
        const error: MiarError = err;
        miarLog.error(`General - Worker of "uploadVideo" didn't executed. ` +
            `(error_message: ${error.message})`);
    }
}

//////////////////////// SUB-FUNCS ////////////////////////
/**
 * @param channelId If you are using "Public Key", enter "user id".
 * If you are using "Private Key", enter "channel username".
 */
async function createAndPublishVideoAsync(
    keyType: KeyType,
    accessToken: string,
    channelId: string,  // PublicKey: userId | PrivateKey: channelUsername
    downloadLink: string,
    channel: Channel,
    title: string,
    description: string,
    isCreatedForKids: boolean,
    country: CountryOrLanguage,
    language: CountryOrLanguage
) {
    const urlByKeyType = (keyType == "public" ?
        shared.getBaseUrl(keyType) + "/user/" + channelId + "/videos"
        : shared.getBaseUrl(keyType) + "/rest/user/" + channelId + "/videos"
    );
    const res = await miarAxios.axiosAsync({
        url: urlByKeyType,
        method: "POST",
        headers: {
            Authorization: "Bearer " + accessToken,
            "Content-Type": MiarContentType.urlencoded,
        },
        data: {
            url: downloadLink,  // mandatory
            channel: channel,  // mandatory
            title: title,  // mandatory
            description: description,
            tag: ["sport", "news"],
            language: language,
            is_created_for_kids: isCreatedForKids,  // mandatory
            country: country,
            published: true,  // mandatory
        }
    });

    return res as MiarResponseModel<CreationAndPublishResponse | MiarErrorModel>
}

async function stopConsumingUntilSpecificTimeAsync(
    waitTimeInMin: number,
    callbackAsync: () => any
) {
    // stop worker of associated queue
    await shared.miarMq.disconnectAsync();

    // restart worker of associated queue after "waitTime"
    const waitTimeInMs = waitTimeInMin * 60 * 1000;
    setTimeout(async () => await callbackAsync(), waitTimeInMs);

    // save log
    if (waitTimeInMin < 1) miarLog.info(`Waiting about ${waitTimeInMin * 60} seconds... `);
    else if (waitTimeInMin < 60) miarLog.info(`Waiting about ${waitTimeInMin} minutes... `);
    else miarLog.info(`Waiting about ${Math.floor(waitTimeInMin / 60)} hours... `);
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
        miarLog.error(`AccessToken - Password - ${err.message}. (username: ${username})`);
        return undefined;
    }
}

async function getAcccessTokenByClientCredentialsAsync(
    apiKey: string,
    apiSecret: string,
    scopes: PermissionScope[]
) {
    try {
        // get access token (THROW)
        const grantType: GrantType = "client_credentials";
        const axiosRes = await miarAxios.axiosAsync({
            url: shared.getBaseUrl("private") + "/oauth/v1/token",
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

        return axiosRes.data as AccessTokenResForClient;
    } catch (err: any) {
        miarLog.error(`AccessToken - Client - ${err.message}`);
        return undefined;
    }

}

async function isAccessTokenValidAsync(qName: string, grantType: GrantType) {
    const qNamesAndTokensOfGrantType = (grantType == "password" ?
        qNamesAndTokens.password
        : qNamesAndTokens.client
    );

    // when any access token is not exists
    if (!(qName in qNamesAndTokensOfGrantType)) return false;

    // check expire date
    const nowDateInMs = Date.now();
    const expireDateInMs = qNamesAndTokensOfGrantType[qName].expiresDateInMs;
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
    if (!await isAccessTokenValidAsync(qName, grantType))
        switch (grantType) {
            case "password":
                {
                    // get new token info
                    const accessTokenInfo = await getAcccessTokenByPasswordAsync(
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
                }
                break;
            case "client_credentials":
                {
                    // get new token info
                    const accessTokenInfo = await getAcccessTokenByClientCredentialsAsync(
                        apiKey,
                        apiSecret,
                        scopes
                    );
                    if (!accessTokenInfo) return false;

                    // add queue to "qNamesAndTokens" if not exists
                    if (!(qName in qNamesAndTokens.client))
                        qNamesAndTokens.client[qName] = {
                            accessToken: "",
                            expiresDateInMs: 0
                        };

                    // update old token info
                    qNamesAndTokens.client[qName].accessToken = accessTokenInfo.access_token;
                    qNamesAndTokens.client[qName].expiresDateInMs = (Date.now()
                        + accessTokenInfo.expires_in * 1000
                    );
                }
                break;
        }

    return true;
}

//////////////////////// SUB FUNCS - DEACTIVATED ////////////////////////
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
    const urlByKeyType = (keyType == "public" ?
        shared.getBaseUrl(keyType) + "/video/" + videoId
        : shared.getBaseUrl(keyType) + "/rest/video/" + videoId
    );
    const res = await miarAxios.axiosAsync({
        url: urlByKeyType,
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
            tag: ["sport", "news"],
            language: language,
            is_created_for_kids: isCreatedForKids,
            country: country,
        }
    });

    return res as MiarResponseModel<PublishResponse | MiarErrorModel>
}

/**
 * Create video by "Public Key".
 */
async function createVideoAsync(
    keyType: "public",
    accessToken: string,
    downloadLink: string,
    userId: string
): Promise<MiarResponseModel<CreationResponse | MiarErrorModel>>
/**
 * Create video by "Private Key".
 */
async function createVideoAsync(
    keyType: "private",
    accessToken: string,
    downloadLink: string,
    channelUsername: string
): Promise<MiarResponseModel<CreationResponse | MiarErrorModel>>
async function createVideoAsync(
    keyType: KeyType,
    accessToken: string,
    downloadLink: string,
    channelId: string
) {
    const urlByKeyType = (keyType == "public" ?
        shared.getBaseUrl(keyType) + "/user/" + channelId + "/videos"
        : shared.getBaseUrl(keyType) + "/rest/user/" + channelId + "/videos"
    );
    const res = await miarAxios.axiosAsync({
        url: urlByKeyType,
        method: "POST",
        headers: {
            "Content-Type": MiarContentType.urlencoded,
            Authorization: "Bearer " + accessToken,
        },
        data: { url: downloadLink }
    });

    return res as MiarResponseModel<CreationResponse | MiarErrorModel>;
}