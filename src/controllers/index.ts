import { Request, Response } from "express";
import miarLog from "../lib/miar-log";
import * as shared from "./workers/index/sharedResources"

/**
 * Upload video to Dailymotion by "Public Key" via "password" grant type.
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
            miarLog.log("Error", "Queue - Message couldn't upload to queue.", {
                video_title: videoTitleForLog
            });

            res.status(500);
            res.json({ status: 500, success: false });
            return;
        }
    }
    { // save log and give response
        miarLog.log("Info", `Message added to queue. (video_title: ${videoTitleForLog})`)

        res.status(200);
        res.json({ status: 200, success: true });
    }
}
/**
 * Upload video to Dailymotion by "Private Key" via "client credentials" grant type.
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
            miarLog.log("Error", "Queue - Message couldn't upload to queue.", {
                video_title: videoTitleForLog
            });

            res.status(500);
            res.json({ status: 500, success: false });
            return;
        }
    }
    { // save log and give response
        miarLog.log("Info", `Message added to queue. (video_title: ${videoTitleForLog})`);
        res.status(200);
        res.json({ status: 200, success: true });
    }
}