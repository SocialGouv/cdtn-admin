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

  it("should handle content with ficheSpDescription correctly", () => {
    const contribution: any = {
      questionName: "Sample Question",
    };

    const content: any = {
      messageBlockGenericNoCDT: "Sample messageBlockGenericNoCDT",
    };

    const metadata: any = generateMetadata(contribution, content);

    expect(metadata.description).toBe("Sample messageBlockGenericNoCDT");
  });

  it.each`
    content                                                                                                                                                                                | expectedDescription
    ${"hello"}                                                                                                                                                                             | ${"hello"}
    ${"<p>hello</p>"}                                                                                                                                                                      | ${"hello"}
    ${"<p>hello&nbsp;hi</p>"}                                                                                                                                                              | ${"hello hi"}
    ${"Commodo amet adipisicing qui Lorem eu dolore est et exercitation voluptate occaecat irure. Cupidatat et culpa laborum adipisicing ipsum eiusmod irure laborum Lorem."}              | ${"Commodo amet adipisicing qui Lorem eu dolore est et exercitation voluptate occaecat irure. Cupidatat et culpa laborum adipisicing ipsum eiusmod irure…"}
    ${"<p>Commodo amet adipisicing qui Lorem eu dolore est et exercitation voluptate occaecat irure. Cupidatat et culpa laborum adipisicing ipsum eiusmod irure<br /> laborum Lorem.</p>"} | ${"Commodo amet adipisicing qui Lorem eu dolore est et exercitation voluptate occaecat irure. Cupidatat et culpa laborum adipisicing ipsum eiusmod irure…"}
  `(
    "should handle description correctly for $expectedDescription",
    async ({ content, expectedDescription }) => {
      const contribution: any = {
        questionName: "Sample Question",
        // Provide other necessary properties
      };

      const metadata = generateMetadata(contribution, {
        content,
      });

      expect(metadata.description).toBe(expectedDescription);
    }
  );

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
