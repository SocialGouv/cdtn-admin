import { getMainBreadcrumb } from "../breadcrumbs";
import { Breadcrumbs } from "@socialgouv/cdtn-types";

describe("getMainBreadcrumb", () => {
  test("Vérifier que le breadcrumbs avec la plus petite position remonte", () => {
    const breadcrumbs1: Breadcrumbs[] = [
      {
        label: "label1",
        position: 1,
        slug: "slug1",
      },
      {
        label: "label2",
        position: 2,
        slug: "slug2",
      },
    ];
    const breadcrumbs2: Breadcrumbs[] = [
      {
        label: "label2",
        position: 2,
        slug: "slug2",
      },
      {
        label: "label3",
        position: 3,
        slug: "slug3",
      },
    ];
    const result = getMainBreadcrumb([breadcrumbs1, breadcrumbs2]);
    expect(result).toEqual(breadcrumbs1);
  });
  test("Vérifier que le breadcrumbs avec le moins de themes remonte en premier", () => {
    const breadcrumbs1: Breadcrumbs[] = [
      {
        label: "label2",
        position: 2,
        slug: "slug2",
      },
      {
        label: "label3",
        position: 3,
        slug: "slug3",
      },
    ];
    const breadcrumbs2: Breadcrumbs[] = [
      {
        label: "label1",
        position: 1,
        slug: "slug2",
      },
      {
        label: "label2",
        position: 2,
        slug: "slug3",
      },
      {
        label: "label3",
        position: 3,
        slug: "slug4",
      },
    ];
    const result = getMainBreadcrumb([breadcrumbs1, breadcrumbs2]);
    expect(result).toEqual(breadcrumbs1);
  });
});
