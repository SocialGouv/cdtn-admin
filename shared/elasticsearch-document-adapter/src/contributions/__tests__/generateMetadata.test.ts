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
    expect(metadata.description).toBe("Sample content");
  });

  it("should handle content with ficheSpDescription correctly", () => {
    const contribution: any = {
      questionName: "Sample Question",
    };

    const content: any = {
      ficheSpDescription: "Sample description",
    };

    const metadata: any = generateMetadata(contribution, content);

    expect(metadata.description).toBe("Sample description");
  });

  it("should slice content correctly", () => {
    const contribution: any = {
      questionName: "Sample Question",
      // Provide other necessary properties
    };

    const content: any = {
      content:
        "Commodo amet adipisicing qui Lorem eu dolore est et exercitation voluptate occaecat irure. Cupidatat et culpa laborum adipisicing ipsum eiusmod irure laborum Lorem. Incididunt veniam sint aliquip eiusmod sit proident irure ut. Incididunt minim excepteur irure pariatur et nulla velit enim est dolore aliquip duis deserunt. Excepteur non eu aliquip esse exercitation labore fugiat laboris nulla. Est sunt veniam est pariatur.Quis fugiat minim ex velit est commodo eiusmod consectetur quis. Ad proident velit do amet veniam ex. Commodo reprehenderit elit sunt ad labore labore proident. Non enim aute ex do velit velit adipisicing ea laboris nostrud ut.",
    };

    const metadata: any = generateMetadata(contribution, content);

    expect(metadata.description).toBe(
      "Commodo amet adipisicing qui Lorem eu dolore est et exercitation voluptate occaecat irure. Cupidatat et culpa laborum adipisicing ipsum eiusmod irure laborum…"
    );
  });

  it("should handle generic contribution correctly", () => {
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

  it("should handle non-generic contribution correctly", () => {
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
