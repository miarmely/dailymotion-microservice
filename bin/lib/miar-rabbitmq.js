"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiarRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class MiarRabbitMQ {
    constructor(url) {
        this.url = url;
    }
    connectAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.connection = yield amqplib_1.default.connect(this.url);
            this.channel = yield this.connection.createChannel();
        });
    }
    disconnectAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.close());
            yield ((_b = this.connection) === null || _b === void 0 ? void 0 : _b.close());
        });
    }
    /**
     * @param qName Queue name.
     */
    sendMessageToQueueAsync(qName, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                yield this.connectAsync();
                yield ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.assertQueue(qName, { durable: true }));
                // send message
                const buffer = Buffer.from(JSON.stringify(msg));
                const isSended = (_b = this.channel) === null || _b === void 0 ? void 0 : _b.sendToQueue(qName, buffer);
                if (!isSended)
                    throw new Error();
                yield this.disconnectAsync();
                return true;
            }
            catch (err) {
                console.log("Error - RabbitMQ - An error occured when sending message to queue. " +
                    `(queue_name: ${qName}) (message: ${JSON.stringify(msg)})`);
                return false;
            }
        });
    }
}
exports.MiarRabbitMQ = MiarRabbitMQ;
