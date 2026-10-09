import { checkNewsImage } from "../image";

const KO = 1024;
const valid = {
  type: "image/webp",
  size: 100 * KO,
  width: 1600,
  height: 900,
};

describe("checkNewsImage", () => {
  it("accepte une image WebP 1600 × 900 légère", () => {
    expect(checkNewsImage(valid)).toEqual({ errors: [] });
  });

  it("avertit quand le fichier dépasse 300 Ko", () => {
    const check = checkNewsImage({ ...valid, size: 420 * KO });

    expect(check.errors).toEqual([]);
    expect(check.warning).toContain("420 Ko");
  });

  it("refuse un format non accepté", () => {
    const check = checkNewsImage({ ...valid, type: "image/svg+xml" });

    expect(check.errors[0]).toContain("Format non accepté");
  });

  it("refuse une image trop étroite", () => {
    const check = checkNewsImage({ ...valid, width: 1000, height: 563 });

    expect(check.errors.join(" ")).toContain("Largeur insuffisante");
    expect(check.errors.join(" ")).toContain("1000 px");
  });

  it("refuse une image qui n'est pas en 16:9", () => {
    const check = checkNewsImage({ ...valid, width: 1600, height: 1000 });

    expect(check.errors.join(" ")).toContain("Ratio incorrect");
  });

  it("refuse un fichier de plus de 5 Mo", () => {
    const check = checkNewsImage({ ...valid, size: 6 * 1024 * KO });

    expect(check.errors.join(" ")).toContain("Fichier trop lourd");
  });
});
