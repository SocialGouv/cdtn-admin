import { generateMetadata } from "../generateMetadata";

jest.mock("../fetchFicheSp");

describe("generateMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return content for type "content"', async () => {
    const contribution: any = {
      questionName: "Hello",
      description: "ça va ?",
      type: "content",
      contentWithGlossary: "some content",
      updated_at: new Date("2021-01-01T00:00:00.000Z"),
    };

    const result = await generateMetadata(contribution);

    expect(result).toEqual({
      date: "01/01/2021",
      text: "ça va ?",
      title: "Hello",
    });
  });
});
