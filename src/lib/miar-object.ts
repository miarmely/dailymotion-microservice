class MiarObject {
    getValueOfProperty<T>(key: string, obj: any): T | undefined {
        return obj[key];
    }
    getItemCountOfProperty(data: any[] | any | undefined): number {
        // when any item not found
        if (data == undefined) return 0;

        // when only one item is exists (typeof data = {})
        else if (data.length == undefined) return 1;

        // when more item is exists (typeof data = [{}])
        else return data.length;
    }
    /**
     */ resetNumberValuedObj(obj: Record<string, number>, ignoredKeys?: string[]): void
    /**
     */ resetNumberValuedObj(obj: Record<string, Record<string, number>>, ignoredKeys?: Record<string, string[]>): void
    resetNumberValuedObj(obj: any, ignoredKeys?: any) {
        for (const key in obj) {
            // reset number valued object (non-nested)
            if (typeof obj[key] == "number") {
                // don't reset ignored key
                if (ignoredKeys && ignoredKeys.includes(key)) continue;

                obj[key] = 0;
            }

            // reset nested objects
            else {
                let innerObj = obj[key];
                let _ignoredKeys = ignoredKeys as Record<string, string[]>;

                for (const innerKey in innerObj) {
                    // don't reset ignored key
                    if (ignoredKeys
                        && key in _ignoredKeys
                        && _ignoredKeys[key].includes(innerKey)) continue;

                    innerObj[innerKey] = 0;
                }
            }
        }
    }
    /**
     * Change propety/properties of object via redefine.
     * @param oldObj source object to be changed
     * @param newValues values to be changed
     * @returns 
     */
    changeObjValues(oldObj: { [k: string]: any }, newValues: { [k: string]: any }) {
        // when any property of "newValues" is not in "oldObj" (THROW)
        for (const prop in newValues)
            if (oldObj[prop] == undefined) throw new Error(`"${prop}" is not in old object.`);

        // change values of "oldObj"
        const newObj: { [k: string]: any } = {};
        for (const prop in oldObj) {
            const oldValue = oldObj[prop];
            const newValue = newValues[prop];

            // change old property value if is changed
            if (newValues[prop] != undefined) newObj[prop] = newValue;
            else newObj[prop] = oldValue;  // don't change
        }

        return newObj;
    }
    /**
     * get names of keys not exists in "obj". 
     * @param keyNames key names to be checked in obj
     * @returns 
     */
    getKeysNotInObj(keyNames: string[], obj: { [x: string]: any }) {
        // check keys whether not exist in "trg"
        let keysNamesNotInObj: string[] = [];
        for (const keyName of keyNames)
            if (!(keyName in obj)) keysNamesNotInObj.push(keyName);

        return keysNamesNotInObj;
    }
}

export default new MiarObject();