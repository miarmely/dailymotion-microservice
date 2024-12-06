type AlertTypes = "Error" | "Info" | "Warning"

class MiarLog {
    private getNowDateInISO = () => (new Date()).toISOString()

    /* without data
    */ log(alertType: AlertTypes, log: string): void
    /* with data
    */ log(alertType: AlertTypes, log: string, data: { [k: string]: any }): void
    log(alertType: AlertTypes, log: string, data?: any) {
        console.log(`${this.getNowDateInISO()} - ${alertType} - ${log}`);
        if (data) console.log(data, "\n")
    }
}

export default new MiarLog();