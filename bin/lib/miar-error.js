"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiarError = void 0;
class MiarError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.MiarError = MiarError;
