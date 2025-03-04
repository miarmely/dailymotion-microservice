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