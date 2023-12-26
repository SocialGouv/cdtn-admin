import { detectNullInObject } from "../detectNullInObject";

describe("detectNullInObject", () => {
  test("returns true for null value", () => {
    expect(detectNullInObject(null)).toBe(true);
  });

  test("returns false for non-null primitive values", () => {
    expect(detectNullInObject(123)).toBe(false);
    expect(detectNullInObject("hello")).toBe(false);
    expect(detectNullInObject(true)).toBe(false);
  });

  test("returns true if nested object contains null", () => {
    const obj = { foo: null };
    expect(detectNullInObject(obj)).toBe(true);
  });

  test("returns false if no null values in nested object", () => {
    const obj = { foo: 123 };
    expect(detectNullInObject(obj)).toBe(false);
  });

  test("handles arrays", () => {
    expect(detectNullInObject([1, 2, null])).toBe(true);
    expect(detectNullInObject([1, 2, 3])).toBe(false);
  });

  test("real world", () => {
    const obj = {
      data: {
        kali_blocks: [
          {
            id: "KALICONT000046993250",
            blocks: null,
          },
        ],
      },
    };
    expect(detectNullInObject(obj)).toBe(true);
  });
});
