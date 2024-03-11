import { diff } from "../array";

describe("diff", () => {
  it("should return the difference between two arrays", () => {
    const a = ["apple", "banana", "orange"];
    const b = ["banana", "orange", "kiwi"];
    const result = diff(a, b);
    expect(result).toEqual(["apple"]);
  });

  it("should return an empty array if both arrays are identical", () => {
    const a = ["apple", "banana", "orange"];
    const b = ["apple", "banana", "orange"];
    const result = diff(a, b);
    expect(result).toEqual([]);
  });

  it("should return the entire array if the second array is empty", () => {
    const a = ["apple", "banana", "orange"];
    const b: string[] = [];
    const result = diff(a, b);
    expect(result).toEqual(["apple", "banana", "orange"]);
  });

  it("should return an empty array if the first array is empty", () => {
    const a: string[] = [];
    const b = ["apple", "banana", "orange"];
    const result = diff(a, b);
    expect(result).toEqual([]);
  });
});
