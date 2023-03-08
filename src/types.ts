export type primitive = 
    bigint
    | boolean
    | Date
    | Function
    | number
    | null
    | RegExp
    | string
    | symbol
    | undefined;

export type array =
    Array<any>
    | BigInt64Array
    | BigUint64Array
    | Float32Array
    | Float64Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | Uint8ClampedArray;

export type error =
    Error
    | EvalError
    | RangeError
    | ReferenceError
    | SyntaxError
    | TypeError
    | URIError;

export type allowable =
    primitive
    | array
    | error
    | object
    | Set<any>
    | Map<any, any>;