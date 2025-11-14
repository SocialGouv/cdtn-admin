import { isHTML, keyFunctionParser } from "..";

describe("keyFunctionParser", () => {
  test.each`
    key           | object  | expected
    ${"markdown"} | ${null} | ${null}
    ${"markdown"} | ${{
  markdown: "wesh",
  res: { markdown: "ok", rien: "yo", yo: { markdown: "yes" } },
}} | ${{
  markdown: "result",
  res: { markdown: "result", rien: "yo", yo: { markdown: "result" } },
}}
    ${"markdown"} | ${{
  markdown: "wesh",
  res: { markdown: "ok", resp: [{ markdown: "no", sol: "oui" }], rien: "yo", yo: { markdown: "yes" } },
}} | ${{
  markdown: "result",
  res: { markdown: "result", resp: [{ markdown: "result", sol: "oui" }], rien: "yo", yo: { markdown: "result" } },
}}
    ${"markdown"} | ${[
  {
    markdown: "wesh",
    res: { markdown: "ok", resp: [{ markdown: "no", sol: "oui" }], rien: "yo", yo: { markdown: "yes" } },
  },
]} | ${[
  {
    markdown: "result",
    res: { markdown: "result", resp: [{ markdown: "result", sol: "oui" }], rien: "yo", yo: { markdown: "result" } },
  },
]}
  `(
    "should return $expected for $object for this $key",
    ({ key, object, expected }) => {
      expect(keyFunctionParser(key, object, () => "result")).toStrictEqual(
        expected
      );
    }
  );
});

describe("isHTML", () => {
  test.each`
    value                         | expected
    ${"yo"}                       | ${false}
    ${"<p>yo</p>"}                | ${true}
    ${"< p >yo< /p >"}            | ${false}
    ${'<p align="center">yo</p>'} | ${true}
  `("should return $expected for $value", ({ value, expected }) => {
    expect(isHTML(value)).toBe(expected);
  });
});
