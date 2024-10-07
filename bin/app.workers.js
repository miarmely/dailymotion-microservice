"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// move variables in ".env" file to "process.env"
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const miar_log_1 = __importDefault(require("./lib/miar-log"));
const worker_1 = require("./controllers/workers/index/worker");
// initialize workers
(0, worker_1.uploadVideo)();
miar_log_1.default.info("Workers is running.");
