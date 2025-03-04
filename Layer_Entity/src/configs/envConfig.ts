class Env {
    static readonly HOST_NAME = (process.env.HOST_NAME ?
        process.env.HOST_NAME
        : "localhost"
    );
    static readonly PORT = (process.env.PORT ?
        process.env.PORT
        : "3001"
    );
    static readonly PORT_WORKERS = (process.env.PORT_WORKERS ?
        process.env.PORT_WORKERS
        : "13001"
    )
    static readonly BASE_URL = `http://${this.HOST_NAME}:${this.PORT}`;
    static readonly KEY_TYPE = (process.env.KEY_TYPE ?
        process.env.KEY_TYPE
        : "public"
    );
    static readonly RABBITMQ_URL = (process.env.RABBITMQ_URL ?
        process.env.RABBITMQ_URL
        : "amqp://localhost"
    )
    static readonly waitTime = {
        UPLOAD_BY_PASS_IN_MIN: (process.env.WAIT_TIME_UPLOAD_BY_PASS_IN_MIN ?
            +process.env.WAIT_TIME_UPLOAD_BY_PASS_IN_MIN
            : 3
        ),
        UPLOAD_BY_CLIENT_IN_MIN: (process.env.WAIT_TIME_UPLOAD_BY_CLIENT_IN_MIN ?
            +process.env.WAIT_TIME_UPLOAD_BY_CLIENT_IN_MIN
            : 3
        )
    }
}

export default Env;