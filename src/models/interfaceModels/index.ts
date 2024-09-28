export interface AccessTokenResForClient {
    access_token: string,
    token_type: string,
    expires_in: number,
    scope: string,
    uid: string,  // user id
}
export interface AccessTokenResForPassword extends AccessTokenResForClient {
    refresh_token: string,
}
export interface PublishInfo {
    id: string,  // video id
    title: string,
    channel: string,
    owner: string  // user id
}
export interface CreationInfo {
    id: string,  // video id
    title: string,
    channel: string | null,
    owner: string,  // user id 
}