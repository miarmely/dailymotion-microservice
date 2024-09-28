class MiarLog {
    private nowUTCDate = () => new Date().toUTCString();

    errorWithDate(log: string) {
        console.log(`${this.nowUTCDate()} - Error - ${log}`);
    }
    infoWithDate(log: string) {
        console.log(`${this.nowUTCDate()} - Info - ${log}`);
    }
    infoWithData(log: string, data: {}) {
        console.log(`${this.nowUTCDate()} - Info - ${log}`);
        console.log(data);
    }
    warningWithDate(log: string) {
        console.log(`${this.nowUTCDate()} - Warning - ${log}`);
    }
}

export default new MiarLog();