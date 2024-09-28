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