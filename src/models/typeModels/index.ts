/////////////////////////// TYPES ///////////////////////////
export type KeyType = "private" | "public";
export type GrantType = "client_credentials" | "password";
export type CountryOrLanguage = "tr" | "us" | "en";  // ...

export type Channel =
    "news" |
    "sport" |
    "auto" |
    "creation" |
    "school" |
    "music" |
    "fun";  // ...

export type PermissionScope =
    "likes" |
    "manage_likes" |
    "manage_players" |
    "manage_playlists" |
    "manage_podcasts" |
    "manage_subscriptions" |
    "manage_subtitles" |
    "manage_videos" |
    "userinfo";

/////////////////////////// VALIDATOR ///////////////////////////
export function validateGrantType(value: any) {
    return validateForStrValue(value, ["client_credentials", "password"])
}
export function validateChannel(value: any) {
    return validateForStrValue(
        value,
        ["news", "sport", "auto", "creation", "school", "music", "fun"]);
}
export function validateCountryOrLanguage(value: any) {
    return validateForStrValue(value, ["tr", "us", "en"]);
}
export function validatePermissionScopes(value: any) {
    return validateForArrayValue(
        value,
        [
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
function validateForStrValue(value: any, validValues: string[]) {
    // type checking
    if (typeof value != "string") return false;

    // value checking
    if (!validValues.includes(value)) return false;

    return true;
}
function validateForArrayValue(value: any, validValues: string[]) {
    // check value whether array
    if (typeof value != "object"
        || value.length == undefined) return false;  // when value is "{}"

    // type checking for all elements of array
    const array: any[] = value;
    for (const element of array) {
        // type checking
        if (typeof element != "string") return false;

        // value checking
        if (!validValues.includes(element)) return false;
    }

    return true;
}