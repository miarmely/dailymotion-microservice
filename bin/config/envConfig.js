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
Env.BASE_URL = `http://${_a.HOST_NAME}:${_a.PORT}`;
Env.KEY_TYPE = (process.env.KEY_TYPE ?
    process.env.KEY_TYPE
    : "public");
Env.RABBITMQ_URL = (process.env.RABBITMQ_URL ?
    process.env.RABBITMQ_URL
    : "amqp://localhost");
exports.default = Env;
