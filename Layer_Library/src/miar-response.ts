export interface MiarReturnModel<TData extends MiarErrorModel | any> {
    success: boolean,
    data: TData
}

interface MiarErrorModel {
    status: number;
    code?: string;
    message?: string;
}

class MiarResponse {
    setErrorResponse(model: MiarErrorModel): MiarReturnModel<MiarErrorModel>
    setErrorResponse(status: number, code: string): MiarReturnModel<MiarErrorModel>
    setErrorResponse(status: number, code: string, msg: string): MiarReturnModel<MiarErrorModel>
    setErrorResponse(...params: any[]) {
        //#region set "error model"
        let miarErrorModel: MiarErrorModel;

        switch (params.length) {
            case 1:
                // if "status" parameter is entered
                if (typeof params[0] === "number")
                    miarErrorModel = {
                        status: params[0]
                    }
                // if "model" parameter is entered
                else
                    miarErrorModel = params[0]
                break;
            case 2:
                miarErrorModel = {
                    status: params[0],
                    code: params[1],
                }
                break;
            default: // if 3
                miarErrorModel = {
                    status: params[0],
                    code: params[1],
                    message: params[2]
                };
                break;
        }
        //#endregion

        //#region set "return model"
        const miarReturnModel: MiarReturnModel<MiarErrorModel> = {
            success: false,
            data: miarErrorModel
        }
        //#endregion

        return miarReturnModel;
    }

    setSuccessResponse<T>(responseData: T): MiarReturnModel<T> {
        const miarReturnModel: MiarReturnModel<T> = {
            success: true,
            data: responseData
        }

        return miarReturnModel;
    }
}

export default MiarResponse;