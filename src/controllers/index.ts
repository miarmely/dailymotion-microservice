import { Request, Response } from "express";

import miarLog from "../lib/miar-log";
import miarAxios from "../lib/miar-axios";
import { MiarError } from "../lib/miar-error";
import { MiarErrorModel } from "../lib/miar-model";
import { MiarContentType } from "../lib/miar-enum";

import * as shared from "./workers/index/sharedResources"
import { GrantType, PermissionScope } from "../models/typeModels";

/**
 * Upload video to Dailymotion by "password" grant type.
 */
export async function uploadVideoByPassword(req: Request, res: Response) {
    { // add request to queue
        var videoTitle: string = req.body.title;
        var videoTitleForLog: string = (videoTitle.length <= 50 ?
            videoTitle
            : videoTitle.substring(0, 40) + "..."
        );
        const isSuccess = await shared.miarMq.sendMessageToQueueAsync(
            shared.queueNames.UPLOAD_VIDEO_BY_PASS,
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
 * Upload video to Dailymotion by "client credentials" grant type.
 */
export async function uploadVideoByClientCredentials(req: Request, res: Response) {
    { // add request to queue
        var videoTitle: string = req.body.title;
        var videoTitleForLog: string = (videoTitle.length <= 50 ?
            videoTitle
            : videoTitle.substring(0, 40) + "..."
        );
        const isSuccess = await shared.miarMq.sendMessageToQueueAsync(
            shared.queueNames.UPLOAD_VIDEO_BY_CLIENT,
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