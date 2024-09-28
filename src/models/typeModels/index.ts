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

/////////////////////////// VALIDATOR ///////////////////////
export function validateChannel(value: any) {
    // type checking
    if (typeof value != "string") return false;

    // value checking
    const validValues = ["news", "sport", "auto", "creation", "school", "music", "fun"];
    if (!(value in validValues)) return false;

    return true;
}
export function validateCountryOrLanguage(value: any) {
    // type checking
    if (typeof value != "string") return false;

    // value checking
    const validValues = ["tr", "us", "en"];
    if (!(value in validValues)) return false;

    return true;
}