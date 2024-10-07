import { Request, Response } from "express";

import miarLog from "../lib/miar-log";
import miarAxios from "../lib/miar-axios";
import { MiarError } from "../lib/miar-error";
import { MiarErrorModel } from "../lib/miar-model";
import { MiarContentType } from "../lib/miar-enum";

import * as shared from "./workers/index/sharedResources"
import { GrantType, PermissionScope } from "../models/typeModels";

/**
 * Upload video to Dailtmotion with download link.
 */
export async function uploadVideo(req: Request, res: Response) {
    { // add request to queue
        var videoTitle: string = req.body.title;
        var videoTitleForLog: string = (videoTitle.length <= 50 ?
            videoTitle
            : videoTitle.substring(0, 40) + "..."
        );
        const isSuccess = await shared.miarMq.sendMessageToQueueAsync(
            shared.queueNames.UPLOAD_VIDEO,
            req.body
        );
        if (!isSuccess) {
            miarLog.error("Queue - Message couldn't upload to queue. " +
                `video_title: ${videoTitleForLog}`);

            res.status(500);
            res.json({ status: 500, success: false });
            return;
        }
    }
    { // save log and give response
        miarLog.info(`Message added to queue. (video_title: ${videoTitleForLog})`);
        res.status(200);
        res.json({ status: 200, success: true });
    }
}
/**
 * Get access token with "password" grant type
 */
export async function getAccessTokenByPassword(req: Request, res: Response) {
    const grantType: GrantType = "password";
    const apiKey: string = req.body.api_key;
    const apiSecret: string = req.body.api_secret;
    const scopes: PermissionScope[] = req.body.scopes;
    const username: string | undefined = req.body.username;
    const password: string | undefined = req.body.password;

    try {
        // get access token (THROW)
        const axiosRes = await miarAxios.axiosAsync({
            url: shared.getBaseUrl() + "/oauth/token",
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
        miarLog.error(`Access Token - ${err.message}. (username: ${username})`);
        res.status(err.status);
        res.json({ status: err.status, success: false });
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
            url: shared.getBaseUrl() + "/oauth/token",
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