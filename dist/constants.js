"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERRORS = exports.ARRAYS = exports.PRIMITIVES = exports.BSONXTypes = void 0;
exports.BSONXTypes = Object.freeze({
    "array": { code: 1, type: "array" },
    "bigint": { code: 2, type: "primitive" },
    "bigint64array": { code: 3, type: "array" },
    "biguint64array": { code: 4, type: "array" },
    "boolean": { code: 5, type: "primitive" },
    "date": { code: 6, type: "primitive" },
    "error": { code: 7, type: "error" },
    "evalerror": { code: 8, type: "error" },
    "float32array": { code: 9, type: "array" },
    "float64array": { code: 10, type: "array" },
    "function": { code: 11, type: "primitive" },
    "int8array": { code: 12, type: "array" },
    "int16array": { code: 13, type: "array" },
    "int32array": { code: 14, type: "array" },
    "map": { code: 15, type: "map" },
    "null": { code: 16, type: "primitive" },
    "number": { code: 17, type: "primitive" },
    "object": { code: 18, type: "object" },
    "rangeerror": { code: 19, type: "error" },
    "referenceerror": { code: 20, type: "error" },
    "regexp": { code: 21, type: "primitive" },
    "set": { code: 22, type: "set" },
    "string": { code: 23, type: "primitive" },
    "symbol": { code: 24, type: "primitive" },
    "syntaxerror": { code: 25, type: "error" },
    "typeerror": { code: 26, type: "error" },
    "uint8array": { code: 27, type: "array" },
    "uint16array": { code: 28, type: "array" },
    "uint32array": { code: 29, type: "array" },
    "uint8clampedarray": { code: 30, type: "array" },
    "undefined": { code: 31, type: "primitive" },
    "urierror": { code: 32, type: "error" },
});
exports.PRIMITIVES = Object.keys(exports.BSONXTypes).filter((key) => exports.BSONXTypes[key].type === "primitive");
exports.ARRAYS = Object.keys(exports.BSONXTypes).filter((key) => exports.BSONXTypes[key].type === "array");
exports.ERRORS = Object.keys(exports.BSONXTypes).filter((key) => exports.BSONXTypes[key].type === "error");
//# sourceMappingURL=constants.js.map