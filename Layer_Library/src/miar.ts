import MiarLazyLoading from "./miar-lazyloading";
import MiarLog from "./miar-log";
import MiarTime from "./miar-time";
import MiarType from "./miar-type";
import MiarObject from "./miar-object";
import MiarAxios from "./miar-axios";
import MiarResponse from "./miar-response";
import MiarError from "./miar-error";

class Miar {
    private readonly _miarLog: MiarLazyLoading<MiarLog>;
    private readonly _miarTime: MiarLazyLoading<MiarTime>;
    private readonly _miarType: MiarLazyLoading<MiarType>;
    private readonly _miarObject: MiarLazyLoading<MiarObject>;
    private readonly _miarAxios: MiarLazyLoading<MiarAxios>;
    private readonly _miarModel: MiarLazyLoading<MiarResponse>;
    private readonly _miarError: MiarLazyLoading<MiarError>;

    public get miarLog() { return this._miarLog.value; }
    public get miarTime() { return this._miarTime.value; }
    public get miarType() { return this._miarType.value; }
    public get miarObject() { return this._miarObject.value; }
    public get miarAxios() { return this._miarAxios.value; }
    public get miarModel() { return this._miarModel.value; }
    public get miarError() { return this._miarError.value; }

    constructor() {
        this._miarLog = new MiarLazyLoading(() => new MiarLog());
        this._miarTime = new MiarLazyLoading(() => new MiarTime());
        this._miarType = new MiarLazyLoading(() => new MiarType());
        this._miarObject = new MiarLazyLoading(() => new MiarObject());
        this._miarAxios = new MiarLazyLoading(() => new MiarAxios());
        this._miarModel = new MiarLazyLoading(() => new MiarResponse());
        this._miarError = new MiarLazyLoading(() => new MiarError());
    }
}

export default new Miar();