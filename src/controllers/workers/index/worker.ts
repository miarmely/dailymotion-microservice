import miarTime from "../../../lib/miar-time"
import miarLog from "../../../lib/miar-log";
import miarAxios from "../../../lib/miar-axios";
import { MiarError } from "../../../lib/miar-error";
import { MiarContentType } from "../../../lib/miar-enum";
import { MiarErrorModel, MiarResponseModel } from "../../../lib/miar-model";

import * as shared from "./sharedResources"
import { CreationInfo, PublishInfo } from "../../../models/interfaceModels"
import { Channel, CountryOrLanguage } from "../../../models/typeModels"

////////////////// EXPORTS //////////////////
export async function uploadVideo() {
    let videoTitle: string = "";
    let publishInfo: PublishInfo | undefined;

    // upload video to dailymotion
    try {
        const qName = shared.queueNames.UPLOAD_VIDEO;

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

                    // create video
                    var creationRes = await createVideoAsync(accessToken, userId, videoDownloadLink);
                    if (!creationRes.success) throw new MiarError(
                        (creationRes.data as MiarErrorModel).status,
                        (creationRes.data as MiarErrorModel).message);

                    // publish video
                    const videoId = (creationRes.data as CreationInfo).id;
                    const publishRes = await publishVideoAsync(
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
                    publishInfo = publishRes.data as PublishInfo;

                    // save log
                    const creationInfo = creationRes.data as CreationInfo;
                    const croppedVideoTitle = (videoTitle.length <= 30 ?
                        videoTitle
                        : videoTitle.substring(0, 30) + "..."
                    );
                    miarLog.info("Video is uploaded to dailymotion. " +
                        `(video_id: ${creationInfo.id}) ` +
                        `(video_title: ${croppedVideoTitle})`
                    );

                    // wait 5 min
                    const minForSleep = 5;
                    miarLog.info(`Waiting about ${minForSleep} minute...`);
                    await miarTime.sleepAsync(minForSleep * 60 * 1000);

                    shared.miarMq.channel?.ack(msg);
                }
                catch (err: any) {
                    // save log
                    const error: MiarError = err;
                    miarLog.errorWithData(`Consume - Video didn't uploaded to dailymotion. (error_message: ${error.message})`, body);

                    // wait 30 min
                    const minForSleep = 30;
                    miarLog.info(`Waiting about ${minForSleep} minute...`);
                    await miarTime.sleepAsync(minForSleep * 60 * 1000);

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

////////////////// PRIVATE //////////////////
async function createVideoAsync(
    accessToken: string,
    userId: string,
    downloadLink: string
) {
    let x = `${shared.getBaseUrl()}/user/${userId}/videos`;
    const res = await miarAxios.axiosAsync({
        url: `${shared.getBaseUrl()}/user/${userId}/videos`,
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
        url: shared.getBaseUrl() + "/video/" + videoId,
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