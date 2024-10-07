"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class MiarTime {
    /**
     * Wait until "ms" before call the function.
     * @param ms Wait time before call the function.
     * @param callbackAsync Function to be called after wait until "ms"
     */
    addDelayBeforeCallAsync(ms, callbackAsync) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise(resolve => setTimeout(() => __awaiter(this, void 0, void 0, function* () { return resolve(yield callbackAsync()); }), ms));
        });
    }
    /**
     * Wait until "ms" synchronously.
     */
    sleepAsync(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => {
                setTimeout(() => resolve(1), ms);
            });
        });
    }
    /**
 * Get difference of dates.
 * @param unit unit of time. It effects the return.
 * @returns time in millisecond or second.
 */
    howMuchTimePassed(startDateInMs, unit, sensitive = 2) {
        const endDateInMs = Date.now();
        const passedTimeInMs = endDateInMs - startDateInMs;
        return unit === "sec" ?
            +(passedTimeInMs / 1000).toFixed(sensitive)
            : +(passedTimeInMs).toFixed(sensitive);
    }
    addDayToDate(count, date) {
        const dateInMs = date.getTime();
        const newDateInMs = dateInMs + (count * 24 * 60 * 60 * 1000);
        return new Date(newDateInMs);
    }
    subtractDayFromDate(count, date) {
        const dateInMs = date.getTime();
        const newDateInMs = dateInMs - (count * 24 * 60 * 60 * 1000);
        return new Date(newDateInMs);
    }
}
exports.default = new MiarTime();
