class MiarModel {
    /**
     * get instance of MiarErrorModel
     */ setErrorModel(status: number, code: string): MiarErrorModel
    /**
     * get instance of MiarErrorModel
     */ setErrorModel(status: number, code: string, msg: string): MiarErrorModel
    /**
     * get instance of MiarErrorModel
     */ setErrorModel(model: MiarErrorModel): MiarErrorModel
    setErrorModel(...params: any[]) {
        // initialize "miarErr"
        let miarErr: MiarErrorModel;
        switch (params.length) {
            case 1:
                miarErr = params[0];
                break;
            case 2:
                miarErr = {
                    status: params[0],
                    code: params[1],
                    message: "null"
                }
                break;
            default:  // if 3 params
                miarErr = {
                    status: params[0],
                    code: params[1],
                    message: params[2]
                };
                break;
        }

        return miarErr;
    }
    /**
     * get instance of MiarResponseModel
     */ setResponseModel<T>(model: MiarResponseModel<T>): MiarResponseModel<T>
    /**
     * get instance of MiarResponseModel
     */ setResponseModel<T>(success: boolean, data: T): MiarResponseModel<T>
    setResponseModel(...params: any[]) {
        // initialize "miarFuncRes"
        let miarFuncRes: MiarResponseModel<any>;
        switch (params.length) {
            case 1:
                miarFuncRes = params[0];
                break;
            default: // if 2 params 
                miarFuncRes = {
                    success: params[0],
                    data: params[1]
                }
                break;
        }

        return miarFuncRes;
    }
}

export interface MiarErrorModel {
    status: number,
    code: string,
    message: string,
}
export interface MiarResponseModel<T> {
    success: boolean,
    data: T
}

export default new MiarModel();