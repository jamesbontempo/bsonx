"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Serializer_instances, _Serializer_toBuffer, _Deserializer_instances, _Deserializer_buffer, _Deserializer_index, _Deserializer_deserialize, _Deserializer_typeFrom, _Deserializer_newPrimitive, _Deserializer_newArray, _Deserializer_newError;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deserializer = exports.deserialize = exports.Serializer = exports.serialize = exports.clone = void 0;
const node_buffer_1 = require("node:buffer");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
function clone(item) {
    return new Deserializer().deserialize(new Serializer().serialize(item));
}
exports.clone = clone;
function serialize(item) {
    return new Serializer().serialize(item);
}
exports.serialize = serialize;
class Serializer {
    constructor() {
        _Serializer_instances.add(this);
    }
    serialize(item) {
        const type = (0, utils_1.typeOf)(item);
        if (!(0, utils_1.isAllowable)(item))
            throw new TypeError("Don't know how to serialize type (received \"" + type + "\")");
        const typeBuffer = node_buffer_1.Buffer.from([constants_1.BSONXTypes[type].code]);
        const sizeBuffer = node_buffer_1.Buffer.alloc(4);
        let dataBuffer = new Uint8Array();
        if ((0, utils_1.isArray)(item)) {
            const size = item.length;
            sizeBuffer.writeUInt32LE(size);
            for (let i = 0; i < size; i++) {
                dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, this.serialize(item[i])]);
            }
        }
        else if ((0, utils_1.isSet)(item)) {
            const size = item.size;
            sizeBuffer.writeUInt32LE(size);
            item.forEach((value) => {
                dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, this.serialize(value)]);
            });
        }
        else if ((0, utils_1.isMap)(item)) {
            const size = item.size;
            sizeBuffer.writeUInt32LE(size);
            item.forEach((value, key) => {
                dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, this.serialize(key), this.serialize(value)]);
            });
        }
        else if ((0, utils_1.isObject)(item)) {
            let size = 0;
            for (const [key, value] of Object.entries(item)) {
                dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, this.serialize(key), this.serialize(value)]);
                size++;
            }
            sizeBuffer.writeUInt32LE(size);
        }
        else if ((0, utils_1.isError)(item)) {
            dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, __classPrivateFieldGet(this, _Serializer_instances, "m", _Serializer_toBuffer).call(this, "string", item.message)]);
            sizeBuffer.writeUInt32LE(dataBuffer.length);
        }
        else if ((0, utils_1.isPrimitive)(item)) {
            dataBuffer = node_buffer_1.Buffer.concat([dataBuffer, __classPrivateFieldGet(this, _Serializer_instances, "m", _Serializer_toBuffer).call(this, type, item)]);
            sizeBuffer.writeUInt32LE(dataBuffer.length);
        }
        return node_buffer_1.Buffer.concat([typeBuffer, sizeBuffer, dataBuffer]);
    }
}
exports.Serializer = Serializer;
_Serializer_instances = new WeakSet(), _Serializer_toBuffer = function _Serializer_toBuffer(type, item) {
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
};
function deserialize(uint8array) {
    return new Deserializer().deserialize(uint8array);
}
exports.deserialize = deserialize;
class Deserializer {
    constructor() {
        _Deserializer_instances.add(this);
        _Deserializer_buffer.set(this, node_buffer_1.Buffer.alloc(0));
        _Deserializer_index.set(this, 0);
    }
    deserialize(uint8array) {
        __classPrivateFieldSet(this, _Deserializer_buffer, node_buffer_1.Buffer.from(uint8array), "f");
        __classPrivateFieldSet(this, _Deserializer_index, 0, "f");
        return __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this);
    }
}
exports.Deserializer = Deserializer;
_Deserializer_buffer = new WeakMap(), _Deserializer_index = new WeakMap(), _Deserializer_instances = new WeakSet(), _Deserializer_deserialize = function _Deserializer_deserialize() {
    const code = __classPrivateFieldGet(this, _Deserializer_buffer, "f")[__classPrivateFieldGet(this, _Deserializer_index, "f")];
    const type = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_typeFrom).call(this, code);
    if (type === "unknown")
        throw new TypeError("Don't know how to deserialize type (received " + code + ")");
    const size = __classPrivateFieldGet(this, _Deserializer_buffer, "f").readInt32LE(__classPrivateFieldGet(this, _Deserializer_index, "f") + 1);
    __classPrivateFieldSet(this, _Deserializer_index, __classPrivateFieldGet(this, _Deserializer_index, "f") + 5, "f");
    if (constants_1.ARRAYS.includes(type)) {
        const array = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_newArray).call(this, type, size);
        for (let i = 0; i < size; i++) {
            array[i] = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this);
        }
        return array;
    }
    else if (type === "set") {
        const set = new Set();
        for (let i = 0; i < size; i++) {
            set.add(__classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this));
        }
        return set;
    }
    else if (type === "map") {
        const map = new Map();
        for (let i = 0; i < size; i++) {
            const key = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this);
            const value = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this);
            map.set(key, value);
        }
        return map;
    }
    else if (type === "object") {
        const object = new Object();
        for (let i = 0; i < size; i++) {
            const key = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this);
            const value = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_deserialize).call(this);
            if ((0, utils_1.isString)(key)) {
                object[key] = value;
            }
            else {
                throw new TypeError("Oject property names can only be strings (received " + (0, utils_1.typeOf)(key) + ")");
            }
        }
        return object;
    }
    else if (constants_1.ERRORS.includes(type)) {
        const end = __classPrivateFieldGet(this, _Deserializer_index, "f") + size;
        const value = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_newError).call(this, type, __classPrivateFieldGet(this, _Deserializer_buffer, "f").subarray(__classPrivateFieldGet(this, _Deserializer_index, "f"), end));
        __classPrivateFieldSet(this, _Deserializer_index, end, "f");
        return value;
    }
    else if (constants_1.PRIMITIVES.includes(type)) {
        const end = __classPrivateFieldGet(this, _Deserializer_index, "f") + size;
        const value = __classPrivateFieldGet(this, _Deserializer_instances, "m", _Deserializer_newPrimitive).call(this, type, __classPrivateFieldGet(this, _Deserializer_buffer, "f").subarray(__classPrivateFieldGet(this, _Deserializer_index, "f"), end));
        __classPrivateFieldSet(this, _Deserializer_index, end, "f");
        return value;
    }
    else {
    }
}, _Deserializer_typeFrom = function _Deserializer_typeFrom(code) {
    const types = constants_1.BSONXTypes;
    const key = Object.keys(types).find((key) => types[key].code === code);
    return key || "unknown";
}, _Deserializer_newPrimitive = function _Deserializer_newPrimitive(type, buffer) {
    if (type === "boolean") {
        return (buffer[0]) ? true : false;
    }
    else if (type === "null") {
        return null;
    }
    else if (type === "undefined") {
        return undefined;
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
}, _Deserializer_newArray = function _Deserializer_newArray(type, size) {
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
}, _Deserializer_newError = function _Deserializer_newError(type, buffer) {
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
};
//# sourceMappingURL=bsonx.js.map