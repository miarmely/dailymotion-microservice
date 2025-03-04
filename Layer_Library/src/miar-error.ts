class MiarError extends Error {
    private _status?: number;
    private _message?: string;

    public get status() { return this._status || 500; }
    public get message() { return this._message || "No detail."; }

    public set status(v: number) { this._status = v; }
    public set message(v: string) { this._message = v; }

    constructor(init?: { status?: number, message?: string }) {
        super(init?.message);
        this._status = init?.status;
        this._message = init?.message;
    }

    public setStatus(status: number) {
        this._status = status;
        return this;
    }
    public setMessage(msg: string) {
        this._message = msg;
        return this;
    }
}

export default MiarError