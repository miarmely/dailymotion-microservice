class MiarLog {
    error(log: string) {
        console.log(`Error - ${log}`);
    }
    info(log: string) {
        console.log(`Info - ${log}`);
    }
    infoWithData(log: string, data: {}) {
        console.log(`Info - ${log}`);
        console.log(data);
    }
    warning(log: string) {
        console.log(`Warning - ${log}`);
    }
}

export default new MiarLog();