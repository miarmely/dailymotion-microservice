type AlertTypes = "Error" | "Info" | "Warning"

class MiarLog {
    private getNowDateInISO = () => (new Date()).toISOString()

    /* without data
    */ log(alertType: AlertTypes, log: string): void
    /* with data
    */ log(alertType: AlertTypes, log: string, data: { [k: string]: any }): void
    log(alertType: AlertTypes, log: string, data?: any) {
        { // write log message
            console.log(`${this.getNowDateInISO()} - ${alertType} - ${log}`);
        }
        { // write data if wants
            // convert data in string to object
            const dataInObj = typeof data === "string" ?
                { info: data }
                : data as { [k: string]: any }

            if (data) console.log(dataInObj, "\n")
        }
    }
}

export default new MiarLog();