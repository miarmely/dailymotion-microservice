import axios, { AxiosRequestConfig } from "axios"
import miarModel, { MiarErrorModel, MiarResponseModel } from "./miar-model";

class MiarAxios {
    /**
     * Send axios request dynamically
     * @returns axios.data or MiarErrorModel
     */
    async axiosAsync(config: AxiosRequestConfig):
        Promise<MiarResponseModel<any> | MiarResponseModel<MiarErrorModel>> {

        try {
            const axiosRes = await axios(config);
            if (axiosRes.status != 200) throw new Error("Axios status is not 200.");

            return miarModel.setResponseModel(true, axiosRes.data);
        }
        catch (err: any) {
            return miarModel.setResponseModel(
                false,
                miarModel.setErrorModel(500, "AxiosError", err.message));
        }
    }
}

export default new MiarAxios();