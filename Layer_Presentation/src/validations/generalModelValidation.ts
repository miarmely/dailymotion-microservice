class Validation {
    //#region private
    private validateForStrValue(value: any, validValues: string[]) {
        // type checking
        if (typeof value != "string") return false;

        // value checking
        if (!validValues.includes(value)) return false;

        return true;
    }
    private validateForArrayValue(value: any, validValues: string[]) {
        // check value whether array
        if (typeof value != "object"
            || value.length == undefined) return false;  // when value is "{}"

        // check array whether empty
        const array: any[] = value;
        if (array.length == 0) return false;

        // type checking for all elements of array
        for (const element of array) {
            // type checking
            if (typeof element != "string") return false;

            // value checking
            if (!validValues.includes(element)) return false;
        }

        return true;
    }
    //#endregion

    public validateGrantType(value: any) {
        return this.validateForStrValue(value, ["client_credentials", "password"])
    }
    public validateChannel(value: any) {
        return this.validateForStrValue(
            value,
            ["news", "sport", "auto", "creation", "school", "music", "fun"]);
    }
    public validateCountryOrLanguage(value: any) {
        return this.validateForStrValue(value, ["tr", "us", "en"]);
    }
    public validatePermissionScopes(value: any) {
        return this.validateForArrayValue(
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
}

export default new Validation();