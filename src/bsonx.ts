const BSONXTypes: Record<string, number> = {
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

const ERRORS = [
    "error",
    "evalerror",
    "rangeerror",
    "referenceerror",
    "syntaxerror",
    "typeerror",
    "urierror",
];

import { Buffer } from "node:buffer";

type primitive = bigint|boolean|Date|Function|number|null|RegExp|string|symbol|undefined;

type array = Array<any>|BigInt64Array|BigUint64Array|Float32Array|Float64Array|Int8Array|Int16Array|Int32Array|Uint8Array|Uint16Array|Uint32Array|Uint8ClampedArray;

type error = Error|EvalError|RangeError|ReferenceError|SyntaxError|TypeError|URIError;

let buffer: Buffer;
let index: number;

export function serialize(item: any): Buffer {
    return s(item);
}

export function deserialize(item: Uint8Array): any {
    buffer = Buffer.from(item);
    index = 0;
    return d();
}

function s(item: any): Buffer {
    const type: string = typeOf(item);
    const typeBuffer: Buffer = Buffer.from([BSONXTypes[type]]);
    const sizeBuffer: Buffer = Buffer.alloc(4);
    let dataBuffer: Uint8Array = new Uint8Array();
    if (isArray(type)) {
        const size: number = item.length;
        sizeBuffer.writeUInt32LE(size);
        for (let i = 0; i < size; i++) {
            dataBuffer = Buffer.concat([dataBuffer, s(item[i])]);
        }
    } else if (type === "set") {
        const size: number = item.size;
        sizeBuffer.writeUInt32LE(size);
        item.forEach((value: any) => {
            dataBuffer = Buffer.concat([dataBuffer, s(value)]);
        });
    } else if (type === "map") {
        const size: number = item.size;
        sizeBuffer.writeUInt32LE(size);
        item.forEach((value: any, key: any) => {
            dataBuffer = Buffer.concat([dataBuffer, s(key), s(value)]);
        });
    } else if (type === "object") {
        let size: number = 0;
        for (const [key, value] of Object.entries(item)) {
            dataBuffer = Buffer.concat([dataBuffer, s(key), s(value)]);
            size++;
        }
        sizeBuffer.writeUInt32LE(size);
    } else if (isPrimitive(type)) {
        dataBuffer = Buffer.concat([dataBuffer, toBuffer(type, item)]);
        sizeBuffer.writeUInt32LE(dataBuffer.length);
    } else if (isError(type)) {
        dataBuffer = Buffer.concat([dataBuffer, toBuffer("string", item.message)]);
        sizeBuffer.writeUInt32LE(dataBuffer.length);
    } else {
        throw new TypeError("Don't know how to serialize type: " + type);
    }
    return Buffer.concat([typeBuffer, sizeBuffer, dataBuffer]);
}

function d(): any {
    const type: string = keyOf(BSONXTypes, buffer[index]);
    const size = buffer.readInt32LE(index + 1);
    index += 5;
    if (isArray(type)) {
        const array: array = newArray(type, size);
        for (let i = 0; i < size; i++) {
            array[i] = d();
        }
        return array;
    } else if (type === "set") {
        const set: Set<any> = new Set();
        for (let i = 0; i < size; i++) {
            set.add(d());
        }
        return set;
    } else if (type === "map") {
        const map: Map<any, any> = new Map();
        for (let i = 0; i < size; i++) {
            const key = d();
            const value = d();
            map.set(key, value);
        }
        return map;
    } else if (type === "object") {
        const object: Record<string, any> = new Object();
        for (let i = 0; i < size; i++) {
            const key = d();
            const value = d();
            object[key] = value;
        }
        return object;
    } else if (isPrimitive(type)) {
        switch (type) {
            case "null":
                return null;
            case "undefined":
                return undefined;
            default:
                const value: any = newPrimitive(type, buffer.subarray(index, index + size));
                index += size;
                return value
        }
    } else if (isError(type)) {
        const value: any = newError(type, buffer.subarray(index, index + size));
        index += size;
        return value
    } else {
        throw new TypeError("Don't know how to deserialize type: " + type);
    }
}

function typeOf(item: any): string {
    let type: string = typeof item;
    if (type !== "object") {
        return type;
    } else if (item === null) {
        return "null";
    } else {
        type = Object.prototype.toString.call(item).slice(8,-1).toLowerCase();
        if (type === "error") {
            return item.name.toLowerCase();
        } else {
            return type;
        }
    }
}

function keyOf(object: Record<string, any>, value: any): string {
    const key: string|undefined = Object.keys(object).find((key) => object[key] === value);
    return key || "unknown";
}

function isPrimitive(type: string): boolean {
    return PRIMITIVES.includes(type);
}

function isArray(type: string): boolean {
    return ARRAYS.includes(type);
}

function isError(type: string): boolean {
    return ERRORS.includes(type);
}

function toBuffer(type: string, item: any): Buffer|Uint8Array {
    switch(type) {
        case "boolean":
            return (item === true) ? new Uint8Array([1]) : new Uint8Array([0]);
        case "date":
            return Buffer.from(item.toISOString());
        case "null":
            return new Uint8Array([0]);
        case "symbol":
            const matches: RegExpMatchArray|null = /^Symbol\((.*)\)$/.exec(item.toString());
            return (matches) ? Buffer.from(matches[1]) : new Uint8Array([0]);
        case "undefined":
            return new Uint8Array([0]);
        default:
            return Buffer.from(item.toString());
    }
}

function newPrimitive(type: string, buffer: Uint8Array): primitive {
    if (type === "boolean") {
        return (buffer[0]) ? true : false
    } else {
        const data: string = buffer.toString();
        switch(type) {
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

function newArray(type: string, size: number): array {
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

function newError(type: string, buffer: Uint8Array): error {
    const message: string = buffer.toString();
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