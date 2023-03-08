/// <reference types="node" />
import { Buffer } from "node:buffer";
export declare function serialize(item: any): Buffer;
export declare function deserialize(item: Uint8Array): any;
