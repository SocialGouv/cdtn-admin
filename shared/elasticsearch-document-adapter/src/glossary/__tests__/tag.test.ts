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

  it("should return tag with clean property", () => {
    const tag = cleanTagHtmlProperty(
      "<div property='<div>yo</div>'>test</div>"
    );
    expect(tag).toEqual("<div property='yo'>test</div>");
  });

  it("should return tag with clean property with content", () => {
    const tag = cleanTagHtmlProperty(
      '<Tab title="Cas où le salarié ne perçoit pas <webcomponent-tooltip>indemnité</webcomponent-tooltip>">Yo <webcomponent-tooltip>indemnité</webcomponent-tooltip>blabla</Tab>'
    );
    expect(tag).toEqual(
      '<Tab title="Cas où le salarié ne perçoit pas indemnité">Yo <webcomponent-tooltip>indemnité</webcomponent-tooltip>blabla</Tab>'
    );
  });
});
