import { Buffer } from "node:buffer";
import { primitive, array, error, allowable } from "./types";
import { BSONXTypes, PRIMITIVES, ARRAYS, ERRORS } from "./constants"
import { isPrimitive, isArray, isError, isString, isSymbol, isSet, isMap, isObject, typeOf } from "./utils";

export function serialize(item: any): Buffer {
    return new Serializer().serialize(item);
}

export class Serializer {

    constructor() {}

    serialize(item: allowable): Buffer {
        const type: string = typeOf(item);
        const typeBuffer: Buffer = Buffer.from([BSONXTypes[type].code]);
        const sizeBuffer: Buffer = Buffer.alloc(4);
        let dataBuffer: Uint8Array = new Uint8Array();
        if (isArray(item)) {
            const size: number = item.length;
            sizeBuffer.writeUInt32LE(size);
            for (let i = 0; i < size; i++) {
                dataBuffer = Buffer.concat([dataBuffer, this.serialize(item[i])]);
            }
        } else if (isSet(item)) {
            const size: number = item.size;
            sizeBuffer.writeUInt32LE(size);
            item.forEach((value: any) => {
                dataBuffer = Buffer.concat([dataBuffer, this.serialize(value)]);
            });
        } else if (isMap(item)) {
            const size: number = item.size;
            sizeBuffer.writeUInt32LE(size);
            item.forEach((value: any, key: any) => {
                dataBuffer = Buffer.concat([dataBuffer, this.serialize(key), this.serialize(value)]);
            });
        } else if (isObject(item)) {
            let size: number = 0;
            for (const [key, value] of Object.entries(item)) {
                dataBuffer = Buffer.concat([dataBuffer, this.serialize(key), this.serialize(value)]);
                size++;
            }
            sizeBuffer.writeUInt32LE(size);
        } else if (isError(item)) {
            dataBuffer = Buffer.concat([dataBuffer, this.#toBuffer("string", item.message)]);
            sizeBuffer.writeUInt32LE(dataBuffer.length);
        } else if (isPrimitive(item)) {
            dataBuffer = Buffer.concat([dataBuffer, this.#toBuffer(type, item)]);
            sizeBuffer.writeUInt32LE(dataBuffer.length);
        } else {
            throw new TypeError("Don't know how to serialize type (received " + type + ")");
        }
        return Buffer.concat([typeBuffer, sizeBuffer, dataBuffer]);
    }

    #toBuffer(type: string, item: any): Buffer | Uint8Array {
        switch(type) {
            case "boolean":
                return (item === true) ? new Uint8Array([1]) : new Uint8Array([0]);
            case "date":
                return Buffer.from(item.toISOString());
            case "null":
                return new Uint8Array([0]);
            case "symbol":
                const matches: RegExpMatchArray | null = /^Symbol\((.*)\)$/.exec(item.toString());
                return (matches) ? Buffer.from(matches[1]) : new Uint8Array([0]);
            case "undefined":
                return new Uint8Array([0]);
            default:
                return Buffer.from(item.toString());
        }
    }
}

export function deserialize(uint8array: Uint8Array): allowable {
    return new Deserializer().deserialize(uint8array);
}

export class Deserializer {
    #buffer: Buffer = Buffer.alloc(0);
    #index: number = 0;

    constructor() {}

    deserialize(uint8array: Uint8Array): allowable {
        this.#buffer = Buffer.from(uint8array);
        this.#index = 0;
        return this.#deserialize();
    }

    #deserialize(): allowable {
        const type: string = this.#typeFrom(this.#buffer[this.#index]);
        const size = this.#buffer.readInt32LE(this.#index + 1);
        this.#index += 5;
        if (ARRAYS.includes(type)) {
            const array: array = this.#newArray(type, size);
            for (let i = 0; i < size; i++) {
                array[i] = this.#deserialize();
            }
            return array;
        } else if (type === "set") {
            const set: Set<any> = new Set();
            for (let i = 0; i < size; i++) {
                set.add(this.#deserialize());
            }
            return set;
        } else if (type === "map") {
            const map: Map<any, any> = new Map();
            for (let i = 0; i < size; i++) {
                const key = this.#deserialize();
                const value = this.#deserialize();
                map.set(key, value);
            }
            return map;
        } else if (type === "object") {
            const object: Record<string | symbol, any> = new Object();
            for (let i = 0; i < size; i++) {
                const key = this.#deserialize();
                const value = this.#deserialize();
                if (isString(key) || isSymbol(key)) {
                    object[key] = value;
                } else {
                    throw new TypeError("Oject property names can only be strings or symbols (received " + typeOf(key) + ")");
                }
            }
            return object;
        } else if (ERRORS.includes(type)) {
            const end = this.#index + size;
            const value: error = this.#newError(type, this.#buffer.subarray(this.#index, end));
            this.#index = end;
            return value
        } else if (PRIMITIVES.includes(type)) {
            const end = this.#index + size;
            const value: primitive = this.#newPrimitive(type, this.#buffer.subarray(this.#index, end));
            this.#index = end;
            return value
        } else {
            throw new TypeError("Don't know how to deserialize type (received " + type + ")");
        }
    }

    #typeFrom(code: number): string {
        const types = BSONXTypes;
        const key: string | undefined = Object.keys(types).find((key) => types[key].code === code);
        return key || "unknown";
    }

    #newPrimitive(type: string, buffer: Uint8Array): primitive {
        if (type === "boolean") {
            return (buffer[0]) ? true : false
        } else if (type === "null") {
            return null;
        } else if (type === "undefined") {
            return undefined;
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
    
    #newArray(type: string, size: number): array {
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
    
    #newError(type: string, buffer: Uint8Array): error {
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
}

