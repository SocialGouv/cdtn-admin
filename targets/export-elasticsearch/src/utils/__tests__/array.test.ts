import { chunkText } from "../array";

describe("chunkText", () => {
  it("should return an empty array when given an empty string", () => {
    const result = chunkText("");
    expect(result).toEqual([]);
  });

  it("should return an array with one element when given a short string", () => {
    const result = chunkText("hello");
    expect(result).toEqual(["hello"]);
  });

  it("should split a long string into multiple chunks", () => {
    const longString =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";
    const result = chunkText(longString, 50);
    expect(result).toEqual([
      "Lorem ipsum dolor sit amet, consectetur adipiscing",
      "elit. Sed ut perspiciatis unde omnis iste natus",
      "error sit voluptatem accusantium doloremque",
      "laudantium, totam rem aperiam, eaque ipsa quae ab",
      "illo inventore veritatis et quasi architecto",
      "beatae vitae dicta sunt explicabo.",
    ]);
  });

  it("should split a long string at the end of a word", () => {
    const longString =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";
    const result = chunkText(longString, 30);
    expect(result).toEqual([
      "Lorem ipsum dolor sit amet,",
      "consectetur adipiscing elit.",
      "Sed ut perspiciatis unde omnis",
      "iste natus error sit",
      "voluptatem accusantium",
      "doloremque laudantium, totam",
      "rem aperiam, eaque ipsa quae",
      "ab illo inventore veritatis et",
      "quasi architecto beatae vitae",
      "dicta sunt explicabo.",
    ]);
  });

  it("should split a long string at the end of a phrase", () => {
    const longString =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";
    const result = chunkText(longString, 1000);
    expect(result).toEqual([
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    ]);
  });
});
