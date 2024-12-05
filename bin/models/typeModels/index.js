"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGrantType = validateGrantType;
exports.validateChannel = validateChannel;
exports.validateCountryOrLanguage = validateCountryOrLanguage;
exports.validatePermissionScopes = validatePermissionScopes;
/////////////////////////// VALIDATOR ///////////////////////////
function validateGrantType(value) {
    return validateForStrValue(value, ["client_credentials", "password"]);
}
function validateChannel(value) {
    return validateForStrValue(value, ["news", "sport", "auto", "creation", "school", "music", "fun"]);
}
function validateCountryOrLanguage(value) {
    return validateForStrValue(value, ["tr", "us", "en"]);
}
function validatePermissionScopes(value) {
    return validateForArrayValue(value, [
        "likes",
        "manage_likes",
        "manage_players",
        "manage_playlists",
        "manage_podcasts",
        "manage_subscriptions",
        "manage_subtitles",
        "manage_videos",
        "userinfo"
    ]);
}
function validateForStrValue(value, validValues) {
    // type checking
    if (typeof value != "string")
        return false;
    // value checking
    if (!validValues.includes(value))
        return false;
    return true;
}
function validateForArrayValue(value, validValues) {
    // check value whether array
    if (typeof value != "object"
        || value.length == undefined)
        return false; // when value is "{}"
    // check array whether empty
    const array = value;
    if (array.length == 0)
        return false;
    // type checking for all elements of array
    for (const element of array) {
        // type checking
        if (typeof element != "string")
            return false;
        // value checking
        if (!validValues.includes(element))
            return false;
    }
    return true;
}
