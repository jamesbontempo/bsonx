"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOf = exports.isMap = exports.isSet = exports.isObject = exports.isSymbol = exports.isString = exports.isError = exports.isArray = exports.isPrimitive = void 0;
const constants_1 = require("./constants");
function isPrimitive(item) {
    return constants_1.BSONXTypes[typeOf(item)].type === "primitive";
}
exports.isPrimitive = isPrimitive;
function isArray(item) {
    return constants_1.BSONXTypes[typeOf(item)].type === "array";
}
exports.isArray = isArray;
function isError(item) {
    return constants_1.BSONXTypes[typeOf(item)].type === "error";
}
exports.isError = isError;
function isString(item) {
    return typeOf(item) === "string";
}
exports.isString = isString;
function isSymbol(item) {
    return typeOf(item) === "symbol";
}
exports.isSymbol = isSymbol;
function isObject(item) {
    return constants_1.BSONXTypes[typeOf(item)].type === "object";
}
exports.isObject = isObject;
function isSet(item) {
    return constants_1.BSONXTypes[typeOf(item)].type === "set";
}
exports.isSet = isSet;
function isMap(item) {
    return constants_1.BSONXTypes[typeOf(item)].type === "map";
}
exports.isMap = isMap;
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
exports.typeOf = typeOf;
//# sourceMappingURL=utils.js.map