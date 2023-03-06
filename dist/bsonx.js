"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = exports.serialize = void 0;
const BSONXTypes = {
    "array": 1,
    "bigint": 2,
    "bigint64array": 3,
    "biguint64array": 4,
    "boolean": 5,
    "date": 6,
    "error": 7,
    "evalerror": 8,
    "float32array": 9,
    "float64array": 10,
    "function": 11,
    "int8array": 12,
    "int16array": 13,
    "int32array": 14,
    "map": 15,
    "null": 16,
    "number": 17,
    "object": 18,
    "rangeerror": 19,
    "referenceerror": 20,
    "regexp": 21,
    "set": 22,
    "string": 23,
    "symbol": 24,
    "syntaxerror": 25,
    "typeerror": 26,
    "uint8array": 27,
    "uint16array": 28,
    "uint32array": 29,
    "uint8clampedarray": 30,
    "undefined": 31,
    "urierror": 32
};
const PRIMITIVES = [
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
const ARRAYS = [
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
const ERRORS = [
    "error",
    "evalerror",
    "rangeerror",
    "referenceerror",
    "syntaxerror",
    "typeerror",
    "urierror",
];
const bson_1 = require("bson");
function serialize(item) {
    return bson_1.BSON.serialize(objectify(item));
}
exports.serialize = serialize;
function deserialize(item) {
    return deobjectify(bson_1.BSON.deserialize(item));
}
exports.deserialize = deserialize;
function objectify(item) {
    const type = typeOf(item);
    const object = {};
    object["type"] = BSONXTypes[type];
    object["data"] = [];
    if (isArray(type)) {
        const size = item.length;
        object["size"] = size;
        for (let i = 0; i < size; i++) {
            object["data"].push(objectify(item[i]));
        }
    }
    else if (type === "set") {
        object["size"] = item.size;
        item.forEach((value) => {
            object["data"].push(objectify(value));
        });
    }
    else if (type === "map") {
        object["size"] = item.size;
        item.forEach((value, key) => {
            object["data"].push([objectify(key), objectify(value)]);
        });
    }
    else if (type === "object") {
        object["size"] = 0;
        for (const [key, value] of Object.entries(item)) {
            object["data"].push([objectify(key), objectify(value)]);
            object["size"]++;
        }
    }
    else if (isPrimitive(type)) {
        if (type === "symbol") {
            const matches = /^Symbol\((.*)\)$/.exec(toString(item));
            object["data"] = (matches) ? matches[1] : undefined;
        }
        else {
            object["data"] = toString(item);
        }
    }
    else if (isError(type)) {
        object["data"] = item.message;
    }
    else {
        throw new TypeError("Don't know how to serialize type: " + type);
    }
    return object;
}
function deobjectify(item) {
    const type = keyOf(BSONXTypes, item["type"]);
    if (isArray(type)) {
        const size = item["size"];
        const array = newArray(type, item["size"]);
        for (let i = 0; i < size; i++) {
            const value = deobjectify(item["data"][i]);
            array[i] = value;
        }
        return array;
    }
    else if (type === "set") {
        const size = item["size"];
        const set = new Set();
        for (let i = 0; i < size; i++) {
            const value = deobjectify(item["data"][i]);
            set.add(value);
        }
        return set;
    }
    else if (type === "map") {
        const size = item["size"];
        const map = new Map();
        for (let i = 0; i < size; i++) {
            const key = deobjectify(item["data"][i][0]);
            const value = deobjectify(item["data"][i][1]);
            map.set(key, value);
        }
        return map;
    }
    else if (type === "object") {
        const size = item["size"];
        const object = new Object();
        for (let i = 0; i < size; i++) {
            const key = deobjectify(item["data"][i][0]);
            const value = deobjectify(item["data"][i][1]);
            object[key] = value;
        }
        return object;
    }
    else if (isPrimitive(type)) {
        return toPrimitive(item);
    }
    else if (isError(type)) {
        return toError(item);
    }
    else {
        throw new TypeError("Don't know how to deserialize type: " + type);
    }
}
function newArray(type, size) {
    switch (type) {
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
            return new Uint8ClampedArray(size);
        default:
            return new Array(size);
    }
}
function toPrimitive(item) {
    const type = keyOf(BSONXTypes, item["type"]);
    const data = item["data"];
    switch (type) {
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
function toError(item) {
    const type = keyOf(BSONXTypes, item["type"]);
    const data = item["data"];
    switch (type) {
        case "evalerror":
            return new EvalError(data);
        case "rangeerror":
            return new RangeError(data);
        case "referenceerror":
            return new ReferenceError(data);
        case "syntaxerror":
            return new SyntaxError(data);
        case "typeerror":
            return new TypeError(data);
        case "urierror":
            return new URIError(data);
        default:
            return new Error(data);
    }
}
function isPrimitive(type) {
    return PRIMITIVES.includes(type);
}
function isArray(type) {
    return ARRAYS.includes(type);
}
function isError(type) {
    return ERRORS.includes(type);
}
function typeOf(item) {
    let type = typeof item;
    if (type !== "object") {
        return type;
    }
    else if (item === null) {
        return "null";
    }
    else {
        type = Object.prototype.toString.call(item).slice(8, -1).toLowerCase();
        if (type === "error") {
            return item.name.toLowerCase();
        }
        else {
            return type;
        }
    }
}
function keyOf(object, value) {
    const key = Object.keys(object).find((key) => object[key] === value);
    return key || "unknown";
}
function toString(item) {
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
//# sourceMappingURL=bsonx.js.map