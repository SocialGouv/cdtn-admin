import {
  cleanTagHtmlProperty,
  getAllTagsProperties,
  getKeyFromProperty,
  getValueFromProperty,
  removeTags,
} from "../tag";

describe("removeTags", () => {
  it("should do nothing", () => {
    const tag = removeTags("test");
    expect(tag).toEqual("test");
  });

  it("should do nothing with single tag", () => {
    const tag = removeTags("<div>test</div>");
    expect(tag).toEqual("test");
    const tag2 = removeTags("<div propertyA='salut'>test</div>");
    expect(tag2).toEqual("test");
  });
});

describe("getAllTagsProperties", () => {
  it("should return empty array", () => {
    const tag = getAllTagsProperties("<div>test</div>");
    expect(tag).toEqual([]);
  });

  it("should return property", () => {
    const tag = getAllTagsProperties('<div propertyA="salut">test</div>');
    expect(tag).toEqual(["propertyA='salut'"]);
  });

  it("should return multiple properties", () => {
    const tag = getAllTagsProperties(
      '<div propertyA="salut" propertyB="salut">test</div>'
    );
    expect(tag).toEqual(["propertyA='salut'", "propertyB='salut'"]);
  });
});

describe("getValueFromProperty", () => {
  it("should return empty string", () => {
    const tag = getValueFromProperty("propertyA");
    expect(tag).toEqual("");
    const tag2 = getValueFromProperty("");
    expect(tag2).toEqual("");
  });

  it("should return value", () => {
    const tag = getValueFromProperty("propertyA='salut'");
    expect(tag).toEqual("salut");
  });
});

describe("getKeyFromProperty", () => {
  it("should return empty string", () => {
    const tag = getKeyFromProperty("propertyA");
    expect(tag).toEqual("");
    const tag2 = getKeyFromProperty("");
    expect(tag2).toEqual("");
  });

  it("should return key", () => {
    const tag = getKeyFromProperty("propertyA='salut'");
    expect(tag).toEqual("propertyA");
  });
});

describe("cleanTagHtmlProperty", () => {
  it("should return empty string", () => {
    const tag = cleanTagHtmlProperty("<div>test</div>");
    expect(tag).toEqual("<div>test</div>");
  });

  // it("should return tag with clean property", () => {
  //   const tag = cleanTagHtmlProperty(
  //     "<div property='<div>yo</div>'>test</div>"
  //   );
  //   expect(tag).toEqual("<div property='yo'>test</div>");
  // });

  // it("should return tag with clean property (more complexe example)", () => {
  //   const tag = cleanTagHtmlProperty(
  //     `<Tab title="test">test</Tab><Tab title="Cas où le salarié ne perçoit pas l'indemnité">\\nL'indemnité de fin de contrat n'est pas due dans les cas suivants\\n</Tab>`
  //   );
  //   expect(tag).toEqual(
  //     `<Tab title="test">test</Tab><Tab title="Cas où le salarié ne perçoit pas l'indemnité">\\nL'<webcomponent-tooltip content="Sommes%20vers%C3%A9es%20en%20compensation%20ou%20en%20r%C3%A9paration%20de%20quelque%20chose.">indemnité</webcomponent-tooltip> de fin de contrat n'est pas due dans les cas suivants\\n</Tab>`
  //   );
  // });
});
