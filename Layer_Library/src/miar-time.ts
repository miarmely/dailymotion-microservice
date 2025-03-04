type MiarUnit = "ms" | "sec";

class MiarTime {
    /**
     * Wait until "ms" before call the function.
     * @param ms Wait time before call the function.
     * @param callbackAsync Function to be called after wait until "ms"
     */
    async addDelayBeforeCallAsync<T>(ms: number, callbackAsync: () => Promise<T>): Promise<T> {
        return await new Promise(resolve =>
            setTimeout(async () =>
                resolve(await callbackAsync()),
                ms));
    }
    /**
     * Wait until "ms" synchronously.
     */
    async sleepAsync(ms: number) {
        await new Promise(resolve => {
            setTimeout(() => resolve(1), ms);
        })
    }
    /**
     * Get difference of dates.
     * @param unit unit of time. It effects the return.
     * @returns time in millisecond or second.
     */
    howMuchTimePassed(
        startDateInMs: number, save
        unit: MiarUnit,
        sensitive: number = 2
    ) {
        const endDateInMs = Date.now();
        const passedTimeInMs = endDateInMs - startDateInMs;

        return unit === "sec" ?
            +(passedTimeInMs / 1000).toFixed(sensitive)
            : +(passedTimeInMs).toFixed(sensitive)
    }

    addDayToDate(count: number, date: Date) {
        const dateInMs = date.getTime();
        const newDateInMs = dateInMs + (count * 24 * 60 * 60 * 1000);

        return new Date(newDateInMs);
    }

    subtractDayFromDate(count: number, date: Date) {
        const dateInMs = date.getTime();
        const newDateInMs = dateInMs - (count * 24 * 60 * 60 * 1000);

        return new Date(newDateInMs);
    }
}

export default MiarTime

