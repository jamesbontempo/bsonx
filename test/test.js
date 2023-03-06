const { Int32 } = require("bson");
const { BSONX } = require("../dist/index");

const expect = require("chai").expect;

const NOW = new Date();

const items = {
    array: [1, 2],
    bigint: 9007199254740992n,
    bigint64array: new BigInt64Array([(-1 * Math.pow(2, 63)).toString()]),
    biguint64array: new BigUint64Array([(Math.pow(2, 64) - 1).toString()]),
    boolean: true,
    date: NOW,
    error: new Error(),
    float32array: new Float32Array([1.2e-38]),
    float64array: new Float64Array([5e-324]),
    function: (name) => { return "Hello " + name + "!"; },
    int8array: new Int8Array([-128]),
    int16array: new Int16Array([-32768]),
    int32array: new Int32Array([-2147483648]),
    map: new Map([[1, "one"]]),
    null: null,
    number: 12.345,
    object: {id: 1, array: [13, 17, "fifty"], set: new Map([[1, ["one", "uno"]], [2, "two"]])},
    regexp: /^\((.*)\)$/g,
    set: new Set([1]),
    string: "test",
    symbol: Symbol("foo"),
    uint8array: new Uint8Array([255]),
    uint16array: new Uint16Array([32767]),
    uint32array: new Uint32Array([4294967295]),
    uint8clampedarray: new Uint8ClampedArray([1337]),
    undefined: undefined
};

describe("BSONX tests", () => {
    it("Array", () => {
        const item = items["array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
    });

    it("BigInt", () => {
        const item = items["bigint"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.equal(9007199254740992n);
    });

    it("BigInt64Array", () => {
        const item = items["bigint64array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
    });

    it("BigUInt64Array", () => {
        const item = items["biguint64array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
    });

    it("Boolean", () => {
        const item = items["boolean"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.equal(item);
    });

    it("Date", () => {
        const item = items["date"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(NOW);
    });

    it("Error", () => {
        const item = items["error"];
        let e = null;
        try {
            BSONX.serialize(item);
        } catch (error) {
            e = error;
        }
        expect(e).to.be.an("Error");
    });

    it("Float32Array", () => {
        const item = items["float32array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
    });

    it("Float64Array", () => {
        const item = items["float64array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
    });

    it("Function", () => {
        const item = items["function"];
        expect(BSONX.deserialize(BSONX.serialize(item))("James")).to.equal("Hello James!");
    });

    it("Int8Array", () => {
        const item = items["int8array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(-128);
    });

    it("Int16Array", () => {
        const item = items["int16array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(-32768);
    });

    it("Int32Array", () => {
        const item = items["int32array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(-2147483648);
    });

    it("Map", () => {
        const item = items["map"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item)).get(1)).to.equal("one");
    });

    it("Null", () => {
        const item = items["null"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.equal(item);
    });

    it("Number", () => {
        const item = items["number"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.equal(item);
    });

    it("Object", () => {
        const item = items["object"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item)).set.get(1)[1]).to.equal("uno");
    });

    it("RegExp", () => {
        const item = items["regexp"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item)).exec("(BSONX)")[1]).to.equal("BSONX");
    });

    it("Set", () => {
        const item = items["set"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item)).has(1)).to.equal(true);
    });

    it("String", () => {
        const item = items["string"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.equal(item);
    });

    it("Symbol", () => {
        const item = items["symbol"];
        expect(BSONX.deserialize(BSONX.serialize(item)).toString()).to.equal(item.toString());
    });

    it("UInt8Array", () => {
        const item = items["uint8array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(255);
    });

    it("UInt16Array", () => {
        const item = items["uint16array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(32767);
    });

    it("UInt32Array", () => {
        const item = items["uint32array"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(4294967295);
    });

    it("UInt8ClampedArray", () => {
        const item = items["uint8clampedarray"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.deep.equal(item);
        expect(BSONX.deserialize(BSONX.serialize(item))[0]).to.equal(255);
    });

    it("Undefined", () => {
        const item = items["undefined"];
        expect(BSONX.deserialize(BSONX.serialize(item))).to.be.undefined;
    });
});