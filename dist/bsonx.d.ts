/// <reference types="node" />
import { Buffer } from "node:buffer";
import { allowable } from "./types";
export declare function serialize(item: any): Buffer;
export declare class Serializer {
    #private;
    constructor();
    serialize(item: allowable): Buffer;
}
export declare function deserialize(uint8array: Uint8Array): allowable;
export declare class Deserializer {
    #private;
    constructor();
    deserialize(uint8array: Uint8Array): allowable;
}
