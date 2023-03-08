# bsonx

`bsonx` is a serialization library, inspired by [bson](https://www.npmjs.com/package/bson), that handles a wider range of native JavaScript object types, including BigInts, Sets, and Maps---even `undefined` and Errors. In addition, `bsonx` does not require input to be a JSON object: it can just as easily serialize solitary items, like primitive values and Arrays.

The "x" equals "extra"!

## Examples

Import `bsonx`
```js
import { BSONX } from "bsonx";
```
... or ...
```js
const { BSONX } = require("bsonx");
```

Serialize a standard JSON object
```js
const serialized = BSONX.serialize({ id: 1, string: "test", number: 123, array: [3, 4, 5] });
// <Buffer 12 04 00 00 00 17 02 00 00 00 69 64 11 01 00 00 00 31 17 ... >
const deserialized = BSONX.deserialize(serialized);
// { id: 1, string: 'test', number: 123, array: [ 3, 4, 5 ] }
```

Serialize a JSON object that contains a BigInt
```js
const serialized = BSONX.serialize({ bigint: 99999999999999999999999n });
// <Buffer 12 01 00 00 00 17 06 00 00 00 62 69 67 69 6e 74 02 17 00 ... >
const deserialized = BSONX.deserialize(serialized);
// { bigint: 99999999999999999999999n }
```

Serialize a solitary Map
```js
const serialized = BSONX.serialize(new Map([[1, ["one", "uno"]], [2, ["two", "dos"]]]));
// <Buffer 0f 02 00 00 00 11 01 00 00 00 31 01 02 00 00 00 17 03 00 ... >
const deserialized = BSONX.deserialize(serialized);
// Map(2) { 1 => [ 'one', 'uno' ], 2 => [ 'two', 'dos' ] }
```

## Methods

### serialize

`serialize(item)`

Serializes an item.

Parameters:

Name|Type|Description
----|----|-----------
`item`|any|Any item of an allowable type (see [Allowable types](#allowable-types))

Returns a buffer containing the serialized version of the item.

### deserialize

`deserialize(buffer)`

Deserializes an item previously serialized with `serialize`.

Parameters:

Name|Type|Description
----|----|-----------
`buffer`|buffer|The buffer produced by a previous call to `serialize`

Returns the original item as a native JavaScript object.

## Allowable types

`bsonx` can serialize the following types:
 - Array
 - BigInt
 - BigInt64Array
 - BigUInt64Array
 - Boolean
 - Date
 - Error
 - EvalError
 - Float32Array
 - Float64Array
 - Function
 - Int8Array
 - Int16Array
 - Int32Array
 - Map
 - null
 - Number
 - Object
 - RangeRrror
 - ReferenceError
 - RegExp
 - Set
 - Sring
 - Symbol
 - SyntaxError
 - TypeError
 - UInt8Array
 - UInt16Array
 - UInt32Array
 - UInt8ClampedArray
 - undefined
 - URIError