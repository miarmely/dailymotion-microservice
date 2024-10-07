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
}

export default Env;