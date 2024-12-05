"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
class Env {
}
_a = Env;
Env.HOST_NAME = (process.env.HOST_NAME ?
    process.env.HOST_NAME
    : "localhost");
Env.PORT = (process.env.PORT ?
    process.env.PORT
    : "3001");
Env.PORT_WORKERS = (process.env.PORT_WORKERS ?
    process.env.PORT_WORKERS
    : "13001");
Env.BASE_URL = `http://${_a.HOST_NAME}:${_a.PORT}`;
Env.KEY_TYPE = (process.env.KEY_TYPE ?
    process.env.KEY_TYPE
    : "public");
Env.RABBITMQ_URL = (process.env.RABBITMQ_URL ?
    process.env.RABBITMQ_URL
    : "amqp://localhost");
Env.waitTime = {
    UPLOAD_BY_PASS_IN_MIN: (process.env.WAIT_TIME_UPLOAD_BY_PASS_IN_MIN ?
        +process.env.WAIT_TIME_UPLOAD_BY_PASS_IN_MIN
        : 3),
    UPLOAD_BY_CLIENT_IN_MIN: (process.env.WAIT_TIME_UPLOAD_BY_CLIENT_IN_MIN ?
        +process.env.WAIT_TIME_UPLOAD_BY_CLIENT_IN_MIN
        : 3)
};
exports.default = Env;
