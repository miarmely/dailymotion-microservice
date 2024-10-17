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