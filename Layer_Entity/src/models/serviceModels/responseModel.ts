interface BaseResponse {
    id: string,  // video id
    title: string,  // video title
    owner: string  // user id
}

export interface PublishResponse extends BaseResponse {
    channel: string,
}
export interface CreationResponse extends BaseResponse {
    channel: null,
}
export interface CreationAndPublishResponse extends PublishResponse {

}