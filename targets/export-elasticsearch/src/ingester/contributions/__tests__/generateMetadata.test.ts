import { generateMetadata } from "../generateMetadata";

describe("generateMetadata", () => {
  it("should generate metadata with correct title and description", () => {
    const contribution: any = {
      questionName: "Sample Question",
    };

    const content: any = {
      content: "Sample content",
    };

    const metadata: any = generateMetadata(contribution, content);

    expect(metadata.title).toBe("Sample Question");
  });

  it("should handle non-generic contribution correctly", () => {
    const contribution: any = {
      questionName: "Sample Question",
      idcc: "123",
      // Provide other necessary properties
    };

    const content: any = {
      content: "Sample content",
    };

    const metadata: any = generateMetadata(contribution, content);

    expect(metadata.text).toBe("123 Sample Question");
  });

  it("should handle generic contribution correctly", () => {
    const contribution: any = {
      questionName: "Sample Question",
      idcc: "0000",
      // Provide other necessary properties
    };

    const content: any = {
      content: "Sample content",
    };

    const metadata: any = generateMetadata(contribution, content);

    expect(metadata.text).toBe("Sample content");
  });
});
