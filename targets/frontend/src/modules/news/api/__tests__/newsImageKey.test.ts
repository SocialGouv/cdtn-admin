import {
  buildNewsImageBaseName,
  findAvailableNewsImageKey,
} from "../newsImageKey";

describe("buildNewsImageBaseName", () => {
  it("slugifie le titre de l'actualité", () => {
    expect(buildNewsImageBaseName("Nouveau barème des indemnités")).toBe(
      "nouveau-bareme-des-indemnites"
    );
  });

  it("utilise un nom par défaut quand le titre ne donne aucun slug", () => {
    expect(buildNewsImageBaseName("!!!")).toBe("actualite");
  });
});

describe("findAvailableNewsImageKey", () => {
  it("ajoute un suffixe tant que la clé existe déjà", async () => {
    const taken = new Set(["a.webp", "a-2.webp"]);
    const exists = async (key: string) => taken.has(key);

    await expect(findAvailableNewsImageKey("a", "webp", exists)).resolves.toBe(
      "a-3.webp"
    );
  });

  it("garde le nom de base quand il est libre", async () => {
    const exists = async () => false;

    await expect(findAvailableNewsImageKey("a", "webp", exists)).resolves.toBe(
      "a.webp"
    );
  });
});
