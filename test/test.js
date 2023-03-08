const { BSON } = require("bson");
const { BSONX } = require("../dist/index");

const expect = require("chai").expect;

const NOW = new Date();

describe("Primitives", () => {

    it("BigInt", () => {
        const input = 9007199254740992n;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.equal(9007199254740992n);
    });

    it("Boolean (true)", () => {
        const input = true;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.true;
    });

    it("Boolean (false)", () => {
        const input = false;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.false;
    });

    it("Date", () => {
        const input = NOW;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(NOW);
    });

    it("Function", () => {
        const input = (world) => { return "Hello " + world + "!"; };
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output("world")).to.equal("Hello world!");
    });

    it("Null", () => {
        const input = null;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.equal(input);
    });

    it("Number", () => {
        const input = 12.345;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.equal(input);
    });

    it("RegExp", () => {
        const input = /^\((.*)\)$/g;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output.exec("(BSONX)")[1]).to.equal("BSONX");
    });

    it("String", () => {
        const input = "test";
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.equal(input);
    });

    it("Symbol", () => {
        const input = Symbol("test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output.toString()).to.equal(input.toString());
    });

    it("Undefined", () => {
        const input = undefined;
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.undefined;
    });

});

describe("Arrays", () => {

    it("Array", () => {
        const input = [1, 2];
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
    });

    it("BigInt64Array", () => {
        const input = new BigInt64Array([-9223372036854775808n, -9223372036854775807n]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
    });

    it("BigUInt64Array", () => {
        const input = new BigUint64Array([18446744073709551615n, 18446744073709551614n, 18446744073709551613n]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
    });

    it("Float32Array", () => {
        const input = new Float32Array([1.2e-38]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
    });

    it("Float64Array", () => {
        const input = new Float64Array([5e-324]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
    });

    it("Int8Array", () => {
        const input = new Int8Array([-128]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(-128);
    });

    it("Int16Array", () => {
        const input = new Int16Array([-32768]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(-32768);
    });

    it("Int32Array", () => {
        const input = new Int32Array([-2147483648]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(-2147483648);
    });

    it("UInt8Array", () => {
        const input = new Uint8Array([255]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(255);
    });

    it("UInt16Array", () => {
        const input = new Uint16Array([32767]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(32767);
    });

    it("UInt32Array", () => {
        const input = new Uint32Array([4294967295]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(4294967295);
    });

    it("UInt8ClampedArray", () => {
        const input = new Uint8ClampedArray([1337]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output[0]).to.equal(255);
    });

});

describe("Collections", () => {

    it("Map", () => {
        const input = new Map([[1, "one"], [2, false]]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output.get(1)).to.equal("one");
    });

    it("Object", () => {
        const input = {id: 1, array: [13, 17, "fifty", new Set(["a", "b", "c"])], map: new Map([[1, ["one", "uno"]], [[2], "two"]])};
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output.array[3].has("a")).to.be.true;
        expect(output.map.get(1)[1]).to.equal("uno");
    });

    it("Set", () => {
        const input = new Set([1, 2, 3]);
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.deep.equal(input);
        expect(output.has(1)).to.equal(true);
    });

});

describe("Errors", () => {

    it("Error", () => {
        const input = new Error("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(Error);
        expect(output.message).to.equal("Test");
    });

    it("EvalError", () => {
        const input = new EvalError("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(EvalError);
        expect(output.message).to.equal("Test");
    });

    it("RangeError", () => {
        const input = new RangeError("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(RangeError);
        expect(output.message).to.equal("Test");
    });

    it("ReferenceError", () => {
        const input = new ReferenceError("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(ReferenceError);
        expect(output.message).to.equal("Test");
    });

    it("SyntaxError", () => {
        const input = new SyntaxError("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(SyntaxError);
        expect(output.message).to.equal("Test");
    });

    it("TypeError", () => {
        const input = new TypeError("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(TypeError);
        expect(output.message).to.equal("Test");
    });

    it("URIError", () => {
        const input = new URIError("Test");
        const output = BSONX.deserialize(BSONX.serialize(input));
        expect(output).to.be.an.instanceOf(URIError);
        expect(output.message).to.equal("Test");
    });

})

describe("Failures", () => {

    it("Unknown (serialize)", () => {
        let e = null;
        try {
            BSONX.serialize(new WeakMap());
        } catch (error) {
            expect(error).to.be.an.instanceOf(TypeError);
        }
    });

    it("Unknown (deserialze)", () => {
        const input = Buffer.from("12000000ff0100000017020000006964050100000001", "hex")
        let e = null;
        try {
            BSONX.deserialize(input);
        } catch (error) {
            expect(error).to.be.an.instanceOf(TypeError);
        }
    });

});