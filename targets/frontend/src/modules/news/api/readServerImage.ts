import sharp from "sharp";
import { checkNewsImage } from "src/modules/news/image";

export const checkUploadedNewsImage = async (
  buffer: Buffer,
  mimetype: string
): Promise<{ errors: string[]; width: number; height: number }> => {
  try {
    const { width = 0, height = 0 } = await sharp(buffer).metadata();
    return {
      errors: checkNewsImage({
        type: mimetype,
        size: buffer.length,
        width,
        height,
      }).errors,
      width,
      height,
    };
  } catch (error) {
    return {
      errors: ["Image illisible : le fichier n'a pas pu être décodé."],
      width: 0,
      height: 0,
    };
  }
};
