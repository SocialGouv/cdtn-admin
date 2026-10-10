export const NEWS_IMAGE_ACCEPT = {
  "image/webp": [".webp"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export const NEWS_IMAGE_MIN_WIDTH = 1200;
export const NEWS_IMAGE_MIN_PIXELS = 300000;
export const NEWS_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const NEWS_IMAGE_WARN_BYTES = 300 * 1024;
export const NEWS_IMAGE_ALT_ADVISED_LENGTH = 125;

export type NewsImageCheck = { errors: string[]; warning?: string };

export const checkNewsImage = ({
  type,
  size,
  width,
  height,
}: {
  type: string;
  size: number;
  width: number;
  height: number;
}): NewsImageCheck => {
  const errors: string[] = [];
  if (!Object.keys(NEWS_IMAGE_ACCEPT).includes(type)) {
    errors.push(
      `Format non accepté (${
        type || "inconnu"
      }). Formats attendus : WebP, JPEG ou PNG.`
    );
  }
  if (width < NEWS_IMAGE_MIN_WIDTH) {
    errors.push(
      `Largeur insuffisante : ${width} px détectés, ${NEWS_IMAGE_MIN_WIDTH} px minimum attendus.`
    );
  }
  if (width * height < NEWS_IMAGE_MIN_PIXELS) {
    errors.push(
      `Image trop petite : ${
        width * height
      } pixels détectés, ${NEWS_IMAGE_MIN_PIXELS} minimum attendus.`
    );
  }
  if (width * 9 !== height * 16) {
    errors.push(
      `Ratio incorrect : ${width} × ${height} px détectés, 16:9 exact attendu (ex. 1600 × 900 px).`
    );
  }
  if (size > NEWS_IMAGE_MAX_BYTES) {
    errors.push(
      `Fichier trop lourd : ${Math.round(
        size / 1024
      )} Ko détectés, 5 Mo maximum.`
    );
  } else if (size > NEWS_IMAGE_WARN_BYTES) {
    return {
      errors,
      warning: `Fichier de ${Math.round(
        size / 1024
      )} Ko : pensez à compresser l'image.`,
    };
  }
  return { errors };
};

export const readImageDimensions = async (
  file: Blob
): Promise<{ width: number; height: number }> => {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Image illisible : le fichier n'a pas pu être décodé.");
  }
  const dimensions = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return dimensions;
};
