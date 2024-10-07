"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MiarLog {
    error(log) {
        console.log(`Error - ${log}`);
    }
    errorWithData(log, data) {
        console.log(`Error - ${log}`);
        console.log(data);
    }
    info(log) {
        console.log(`Info - ${log}`);
    }
    infoWithData(log, data) {
        console.log(`Info - ${log}`);
        console.log(data);
    }
    warning(log) {
        console.log(`Warning - ${log}`);
    }
}
exports.default = new MiarLog();
