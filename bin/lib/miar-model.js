"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MiarModel {
    setErrorModel(...params) {
        // initialize "miarErr"
        let miarErr;
        switch (params.length) {
            case 1:
                miarErr = params[0];
                break;
            case 2:
                miarErr = {
                    status: params[0],
                    code: params[1],
                    message: "null"
                };
                break;
            default: // if 3 params
                miarErr = {
                    status: params[0],
                    code: params[1],
                    message: params[2]
                };
                break;
        }
        return miarErr;
    }
    setResponseModel(...params) {
        // initialize "miarFuncRes"
        let miarFuncRes;
        switch (params.length) {
            case 1:
                miarFuncRes = params[0];
                break;
            default: // if 2 params 
                miarFuncRes = {
                    success: params[0],
                    data: params[1]
                };
                break;
        }
        return miarFuncRes;
    }
}
exports.default = new MiarModel();
