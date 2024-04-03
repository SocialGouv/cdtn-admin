import { removeUndefinedKeys } from "../removeUndefinedKeys";

describe("removeUndefinedKeys", () => {
  it("should remove undefined keys from the object", () => {
    const object = {
      name: "John",
      age: 30,
      address: undefined,
      email: "john@example.com",
    };

    const result = removeUndefinedKeys(object);

    expect(result).toEqual({
      name: "John",
      age: 30,
      email: "john@example.com",
    });
  });

  it("should return the same object if there are no undefined keys", () => {
    const object = {
      name: "John",
      age: 30,
      email: "john@example.com",
    };

    const result = removeUndefinedKeys(object);

    expect(result).toEqual(object);
  });

  it("should return an empty object if the input object is empty", () => {
    const object = {};

    const result = removeUndefinedKeys(object);

    expect(result).toEqual({});
  });
});
