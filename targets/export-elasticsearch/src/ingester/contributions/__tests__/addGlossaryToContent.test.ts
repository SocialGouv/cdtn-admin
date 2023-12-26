import { addGlossaryToContent } from "../addGlossaryToContent";

describe("addGlossaryToContent", () => {
  it("should return original content if ficheSpDescription exists", () => {
    const content = {
      ficheSpDescription: "Description",
      content: "Content",
    };
    const addGlossary = jest.fn();

    const result = addGlossaryToContent(content, addGlossary);

    expect(result).toEqual(content);
    expect(addGlossary).not.toHaveBeenCalled();
  });

  it("should call addGlossary and return modified content if no ficheSpDescription", () => {
    const content = {
      content: "Content",
    };
    const addGlossary = jest.fn(() => "Modified content");

    const result = addGlossaryToContent(content, addGlossary);

    expect(result).toEqual({
      content: "Modified content",
    });
    expect(addGlossary).toHaveBeenCalledWith("Content");
    expect(addGlossary).toHaveBeenCalledTimes(1);
  });
});
