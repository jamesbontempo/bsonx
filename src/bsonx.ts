const BSONXTypes: Record<string, number> = {
    "array": 1,
    "bigint": 2,
    "bigint64array": 3,
    "biguint64array": 4,
    "boolean": 5,
    "date": 6,
    "float32array": 7,
    "float64array": 8,
    "function": 9,
    "int8array": 10,
    "int16array": 11,
    "int32array": 12,
    "map": 13,
    "null": 14,
    "number": 15,
    "object": 16,
    "regexp": 17,
    "set": 18,
    "string": 19,
    "symbol": 20,
    "uint8array": 21,
    "uint16array": 22,
    "uint32array": 23,
    "uint8clampedarray": 24,
    "undefined": 25
};

const PRIMITIVES: Array<string> = [
    "bigint",
    "boolean",
    "date",
    "function",
    "number",
    "null",
    "regexp",
    "string",
    "symbol",
    "undefined"
];

const ARRAYS: Array<string> = [
    "array",
    "bigint64array",
    "biguint64array",
    "float32array",
    "float64array",
    "int8array",
    "int16array",
    "int32array",
    "uint8array",
    "uint16array",
    "uint32array",
    "uint8clampedarray"
];

import { BSON } from "bson";


export function serialize(item: any): Uint8Array {
    return BSON.serialize(objectify(item));
}

export function deserialize(item: Uint8Array): any {
    return deobjectify(BSON.deserialize(item));
}

function objectify(item: any) {
    const type = typeOf(item);
    const object: Record<string, any> = {};
    object["type"] = BSONXTypes[type];
    object["data"] = [];
    if (isArray(item)) {
        const size = item.length;
        object["size"] = size;
        for (let i = 0; i < size; i++) {
            object["data"].push(objectify(item[i]));
        }
    } else if (type === "set") {
        object["size"] = item.size;
        item.forEach((value: any) => {
            object["data"].push(objectify(value));
        });
    } else if (type === "map") {
        object["size"] = item.size;
        item.forEach((value: any, key: any) => {
            object["data"].push([objectify(key), objectify(value)]);
        });
    } else if (type === "object") {
        object["size"] = 0;
        for (const [key, value] of Object.entries(item)) {
            object["data"].push([objectify(key), objectify(value)]);
            object["size"]++;
        }
    } else if (isPrimitive(item)) {
        if (type === "symbol") {
            const symbol = /^Symbol\((.*)\)$/.exec(toString(item));
            object["data"] = (symbol) ? symbol[1] : "";
        } else {
            object["data"] = toString(item);
        }
    } else {
        throw new TypeError("Don't know how to objectify a " + type);
    }
    return object;
}

function deobjectify(item: Record<string, any>) {
    const type = keyOf(BSONXTypes, item["type"]);
    if (ARRAYS.includes(type)) {
        const size = item["size"];
        const array = newArray(type, item["size"]);
        for (let i = 0; i < size; i++) {
            const value = deobjectify(item["data"][i]);
            array[i] = value;
        }
        return array;
    } else if (type === "set") {
        const size = item["size"];
        const set = new Set();
        for (let i = 0; i < size; i++) {
            const value = deobjectify(item["data"][i]);
            set.add(value);
        }
        return set;
    } else if (type === "map") {
        const size = item["size"];
        const map = new Map();
        for (let i = 0; i < size; i++) {
            const key = deobjectify(item["data"][i][0]);
            const value = deobjectify(item["data"][i][1]);
            map.set(key, value);
        }
        return map;
    } else if (type === "object") {
        const size = item["size"];
        const object: Record<string, any> = new Object();
        for (let i = 0; i < size; i++) {
            const key = deobjectify(item["data"][i][0]);
            const value = deobjectify(item["data"][i][1]);
            object[key] = value;
        }
        return object;
    } else if (PRIMITIVES.includes(type)) {
        return toPrimitive(item);
    } else {
        throw new TypeError("Don't know how to deobjectify a " + type);
    }
}

function newArray(type: string, size: number): Array<any>|BigInt64Array|BigUint64Array|Float32Array|Float64Array|Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray {
    switch(type) {
        case "bigint64array":
            return new BigInt64Array(size);
        case "biguint64array":
            return new BigUint64Array(size);
        case "float32array":
            return new Float32Array(size);
        case "float64array":
            return new Float64Array(size);
        case "int8array":
            return new Int8Array(size);
        case "int16array":
            return new Int16Array(size);
        case "int32array":
            return new Int32Array(size);
        case "uint8array":
            return new Uint8Array(size);
        case "uint16array":
            return new Uint16Array(size);
        case "uint32array":
            return new Uint32Array(size);
        case "uint8clampedarray":
            return new Uint8ClampedArray(size)
        default:
            return new Array(size);
    }
}

function toPrimitive(item: any): any {
    const type = keyOf(BSONXTypes, item["type"]);
    const data = item["data"];
    switch(type) {
        case "bigint":
            return BigInt(data);
        case "boolean":
            return (data === "true") ? true : false;
        case "date":
            return new Date(data);
        case "function":
            return new Function("return " + data)();
        case "number":
            return Number(data);
        case "null":
            return null;
        case "regexp":
            const matches = /^\/(.*)\/(.*)$/.exec(data);
            return (matches) ? new RegExp(matches[1], matches[2]) : undefined;
        case "string":
            return data;
        case "symbol":
            return Symbol.for(data);
        case "undefined":
            return undefined;
    }
}

function isPrimitive(item: any): boolean {
    return PRIMITIVES.includes(typeOf(item));
}

function isArray(item: any): boolean {
    return ARRAYS.includes(typeOf(item));
}

function typeOf(item: any): string {
	const type = typeof item;
	if (type !== "object") {
		return type;
	} else if (item === null) {
		return "null";
	} else {
		return Object.prototype.toString.call(item).slice(8,-1).toLowerCase();
	}
}

function keyOf(object: Record<string, any>, value: any): string {
    const key = Object.keys(object).find((key) => object[key] === value);
    return key || "n/a";
}

function toString(item: any): string {
    switch (typeOf(item)) {
        case "date":
            return item.toISOString();
        case "null":
            return "null";
        case "undefined":
            return "undefined";
        default:
            return item.toString();
    }
}