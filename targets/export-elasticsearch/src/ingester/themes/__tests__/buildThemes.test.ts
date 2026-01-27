import { buildThemes } from "../buildThemes";
import { buildGetBreadcrumbs } from "../../breadcrumbs";
import data from "./themes.json";

describe("Build themes", () => {
  it("should return an array ['id1', 'id2']", () => {
    const themes: any = data;
    const getBreadcrumbs = buildGetBreadcrumbs(themes);
    const output = buildThemes(themes, getBreadcrumbs);
    expect(output).toHaveLength(134);
    expect(output[0].parentSlug).toBeUndefined();
    expect(output[0].breadcrumbs).toEqual([]);
    expect(output[20].parentSlug).toBe("fin-et-rupture-du-contrat");
    expect(output[20].breadcrumbs).toEqual([
      {
        label: "Fin et rupture du contrat ",
        position: 25,
        slug: "/themes/fin-et-rupture-du-contrat",
      },
    ]);
  });
});
