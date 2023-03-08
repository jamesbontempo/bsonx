import { primitive, array, error, allowable } from "./types";
import { BSONXTypes } from "./constants"

export function isAllowable(item: any): item is allowable {
    return BSONXTypes[typeOf(item)] !== undefined;
}

export function isPrimitive(item: allowable): item is primitive {
    return BSONXTypes[typeOf(item)].type === "primitive";
}

export function isArray(item: allowable): item is array {
    return BSONXTypes[typeOf(item)].type === "array";
}

export function isError(item: allowable): item is error {
    return BSONXTypes[typeOf(item)].type === "error";
}

export function isString(item: allowable): item is string {
    return typeOf(item) === "string";
}

export function isObject(item: allowable): item is object {
    return BSONXTypes[typeOf(item)].type === "object";
}

export function isSet(item: allowable): item is Set<any> {
    return BSONXTypes[typeOf(item)].type === "set";
}

export function isMap(item: allowable): item is Map<any, any> {
    return BSONXTypes[typeOf(item)].type === "map";
}

export function typeOf(item: any): string {
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