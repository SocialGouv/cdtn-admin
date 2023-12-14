import { getTheme } from "../getTheme";

describe("getTheme", () => {
  it("returns the first breadcrumb label", () => {
    const data: any = {
      breadcrumbs: [{ label: "Theme 1" }, { label: "Theme 2" }],
    };

    expect(getTheme(data)).toBe("Theme 1");
  });

  it("returns undefined if no breadcrumbs", () => {
    const data: any = {
      breadcrumbs: [],
    };

    expect(getTheme(data)).toBeUndefined();
  });
});
