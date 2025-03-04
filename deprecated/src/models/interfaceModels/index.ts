export interface AccessTokenResForClient {
    scope: string,
    access_token: string,
    expires_in: number,  // second
    refresh_token: string,
    token_type: string,
}
export interface AccessTokenResForPassword extends AccessTokenResForClient {
    uid: string
}
export interface PublishResponse extends BaseResponse {
    channel: string,
}
export interface CreationResponse extends BaseResponse {
    channel: null,
}
export interface CreationAndPublishResponse extends PublishResponse {

}

////////////////////////////////////////////////////////////
interface BaseResponse {
    id: string,  // video id
    title: string,  // video title
    owner: string  // user id
}