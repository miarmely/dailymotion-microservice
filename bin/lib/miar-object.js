"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MiarObject {
    getValueOfProperty(key, obj) {
        return obj[key];
    }
    getItemCountOfProperty(data) {
        // when any item not found
        if (data == undefined)
            return 0;
        // when only one item is exists (typeof data = {})
        else if (data.length == undefined)
            return 1;
        // when more item is exists (typeof data = [{}])
        else
            return data.length;
    }
    resetNumberValuedObj(...args) {
        for (const obj of args)
            for (const key in obj) {
                // reset number valued object
                if (typeof obj[key] == "number")
                    obj[key] = 0;
                // reset nested objects
                else {
                    let innerObj = obj[key];
                    for (const _key in innerObj)
                        innerObj[_key] = 0;
                }
            }
    }
    /**
     * Change propety/properties of object via redefine.
     * @param oldObj source object to be changed
     * @param newValues values to be changed
     * @returns
     */
    changeObjValues(oldObj, newValues) {
        // when any property of "newValues" is not in "oldObj" (THROW)
        for (const prop in newValues)
            if (oldObj[prop] == undefined)
                throw new Error(`"${prop}" is not in old object.`);
        // change values of "oldObj"
        const newObj = {};
        for (const prop in oldObj) {
            const oldValue = oldObj[prop];
            const newValue = newValues[prop];
            // change old property value if is changed
            if (newValues[prop] != undefined)
                newObj[prop] = newValue;
            else
                newObj[prop] = oldValue; // don't change
        }
        return newObj;
    }
    /**
     * get names of keys not exists in "obj".
     * @param keyNames key names to be checked in obj
     * @returns
     */
    getKeysNotInObj(keyNames, obj) {
        // check keys whether not exist in "trg"
        let keysNamesNotInObj = [];
        for (const keyName of keyNames)
            if (!(keyName in obj))
                keysNamesNotInObj.push(keyName);
        return keysNamesNotInObj;
    }
}
exports.default = new MiarObject();
