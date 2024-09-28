class EnvConfig {
    static HOST_NAME = (process.env.HOST_NAME ?
        process.env.HOST_NAME
        : "localhost"
    );
    static PORT = (process.env.PORT ?
        process.env.PORT
        : "3001"
    );
    static BASE_URL = `http://${this.HOST_NAME}:${this.PORT}`;
    static KEY_TYPE = (process.env.KEY_TYPE ?
        process.env.KEY_TYPE
        : "public"
    );
    static API_KEY = (process.env.API_KEY ?
        process.env.API_KEY
        : ""
    );
    static API_SECRET = (process.env.API_SECRET ?
        process.env.API_SECRET
        : ""
    );
    static USERNAME = (process.env.USERNAME ?
        process.env.USERNAME
        : ""
    );
    static PASSWORD = (process.env.PASSWORD ?
        process.env.PASSWORD
        : ""
    );
}

export default EnvConfig;