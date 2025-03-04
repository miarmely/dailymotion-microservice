class MiarLazyLoading<T> {
    private _value?: T;
    private readonly _instance: () => T;

    public get value() {
        // initialize "_value" if not defined (just first time)
        if (!this._value) this._value = this._instance();

        return this._value
    }

    constructor(instance: () => T) {
        this._instance = instance;
    }
}

export default MiarLazyLoading;