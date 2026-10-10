import sharp from "sharp";
import { checkUploadedNewsImage } from "../readServerImage";

const makePng = (width: number, height: number) =>
  sharp({
    create: { width, height, channels: 3, background: "#fff" },
  })
    .png()
    .toBuffer();

describe("checkUploadedNewsImage", () => {
  it("accepte une image 1600x900 et renvoie ses dimensions", async () => {
    const result = await checkUploadedNewsImage(
      await makePng(1600, 900),
      "image/png"
    );
    expect(result.errors).toEqual([]);
    expect(result.width).toBe(1600);
    expect(result.height).toBe(900);
  });

  it("refuse une image 1000x1000 (largeur et ratio)", async () => {
    const result = await checkUploadedNewsImage(
      await makePng(1000, 1000),
      "image/png"
    );
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it("refuse un fichier illisible", async () => {
    const result = await checkUploadedNewsImage(
      Buffer.from("not an image"),
      "image/png"
    );
    expect(result.errors.join(" ")).toContain("Image illisible");
  });
});
