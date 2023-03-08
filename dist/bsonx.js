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
const node_buffer_1 = require("node:buffer");
let buffer;
let index;
function serialize(item) {
    return s(item);
}
exports.serialize = serialize;
function deserialize(item) {
    buffer = node_buffer_1.Buffer.from(item);
    index = 0;
    return d();
}
exports.deserialize = deserialize;
function s(item) {
    const type = typeOf(item);
    const typeBuffer = node_buffer_1.Buffer.from([BSONXTypes[type]]);
    const sizeBuffer = node_buffer_1.Buffer.alloc(4);
    let dataBuffer = new Uint8Array();
    if (isArray(type)) {
        const size = item.length;
        sizeBuffer.writeUInt32LE(size);
        for (let i = 0; i < size; i++) {
            dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, s(item[i])]);
        }
    }
    else if (type === "set") {
        const size = item.size;
        sizeBuffer.writeUInt32LE(size);
        item.forEach((value) => {
            dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, s(value)]);
        });
    }
    else if (type === "map") {
        const size = item.size;
        sizeBuffer.writeUInt32LE(size);
        item.forEach((value, key) => {
            dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, s(key), s(value)]);
        });
    }
    else if (type === "object") {
        let size = 0;
        for (const [key, value] of Object.entries(item)) {
            dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, s(key), s(value)]);
            size++;
        }
        sizeBuffer.writeUInt32LE(size);
    }
    else if (isPrimitive(type)) {
        dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, toBuffer(type, item)]);
        sizeBuffer.writeUInt32LE(dataBuffer.length);
    }
    else if (isError(type)) {
        dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, toBuffer("string", item.message)]);
        sizeBuffer.writeUInt32LE(dataBuffer.length);
    }
    else {
        throw new TypeError("Don't know how to serialize type: " + type);
    }
    return node_buffer_1.Buffer.concat([typeBuffer, sizeBuffer, dataBuffer]);
}
function d() {
    const type = keyOf(BSONXTypes, buffer[index]);
    const size = buffer.readInt32LE(index + 1);
    index += 5;
    if (isArray(type)) {
        const array = newArray(type, size);
        for (let i = 0; i < size; i++) {
            array[i] = d();
        }
        return array;
    }
    else if (type === "set") {
        const set = new Set();
        for (let i = 0; i < size; i++) {
            set.add(d());
        }
        return set;
    }
    else if (type === "map") {
        const map = new Map();
        for (let i = 0; i < size; i++) {
            const key = d();
            const value = d();
            map.set(key, value);
        }
        return map;
    }
    else if (type === "object") {
        const object = new Object();
        for (let i = 0; i < size; i++) {
            const key = d();
            const value = d();
            object[key] = value;
        }
        return object;
    }
    else if (isPrimitive(type)) {
        switch (type) {
            case "null":
                return null;
            case "undefined":
                return undefined;
            default:
                const value = newPrimitive(type, buffer.subarray(index, index + size));
                index += size;
                return value;
        }
    }
    else if (isError(type)) {
        const value = newError(type, buffer.subarray(index, index + size));
        index += size;
        return value;
    }
    else {
        throw new TypeError("Don't know how to deserialize type: " + type);
    }
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
function isPrimitive(type) {
    return PRIMITIVES.includes(type);
}
function isArray(type) {
    return ARRAYS.includes(type);
}
function isError(type) {
    return ERRORS.includes(type);
}
function toBuffer(type, item) {
    switch (type) {
        case "boolean":
            return (item === true) ? new Uint8Array([1]) : new Uint8Array([0]);
        case "date":
            return node_buffer_1.Buffer.from(item.toISOString());
        case "null":
            return new Uint8Array([0]);
        case "symbol":
            const matches = /^Symbol\((.*)\)$/.exec(item.toString());
            return (matches) ? node_buffer_1.Buffer.from(matches[1]) : new Uint8Array([0]);
        case "undefined":
            return new Uint8Array([0]);
        default:
            return node_buffer_1.Buffer.from(item.toString());
    }
}
function newPrimitive(type, buffer) {
    if (type === "boolean") {
        return (buffer[0]) ? true : false;
    }
    else {
        const data = buffer.toString();
        switch (type) {
            case "bigint":
                return BigInt(data);
            case "date":
                return new Date(data);
            case "function":
                return new Function("return " + data)();
            case "number":
                return Number(data);
            case "regexp":
                const matches = /^\/(.*)\/(.*)$/.exec(data);
                return (matches) ? new RegExp(matches[1], matches[2]) : undefined;
            case "string":
                return data;
            case "symbol":
                return Symbol.for(data);
        }
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
function newError(type, buffer) {
    const message = buffer.toString();
    switch (type) {
        case "evalerror":
            return new EvalError(message);
        case "rangeerror":
            return new RangeError(message);
        case "referenceerror":
            return new ReferenceError(message);
        case "syntaxerror":
            return new SyntaxError(message);
        case "typeerror":
            return new TypeError(message);
        case "urierror":
            return new URIError(message);
        default:
            return new Error(message);
    }
}
//# sourceMappingURL=bsonx.js.map