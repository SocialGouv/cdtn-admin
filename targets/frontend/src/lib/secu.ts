import formidable from "formidable";
import fs from "fs";
import os from "os";
import path from "path";

export const ALLOWED_PNG = [".png"];
export const ALLOWED_JPG = [".jpg", ".jpeg"];
export const ALLOWED_SVG = [".svg"];
export const ALLOWED_PDF = [".pdf"];
export const ALLOWED_DOC = [".doc", ".docx"];
export const ALLOWED_WEBP = [".webp"];

const ALLOWED_EXTENSIONS = [
  ...ALLOWED_PNG,
  ...ALLOWED_JPG,
  ...ALLOWED_SVG,
  ...ALLOWED_PDF,
  ...ALLOWED_DOC,
  ...ALLOWED_WEBP,
];

export const isAllowedFile = (file: formidable.File) => {
  const extension = file.originalFilename
    ?.toLowerCase()
    .split(".")
    .reverse()[0];
  if (!extension) return false;
  return ALLOWED_EXTENSIONS.includes("." + extension);
};

export const UPLOAD_DIR = path.resolve(os.tmpdir());

// formidable écrit les fichiers reçus dans UPLOAD_DIR : on refuse tout chemin
// qui en sortirait avant de lire le fichier.
export const getUploadedFilePath = (file: formidable.File): string => {
  const filepath = path.resolve(UPLOAD_DIR, path.basename(file.filepath));
  if (!filepath.startsWith(UPLOAD_DIR + path.sep)) {
    throw new Error("Invalid upload path");
  }
  return filepath;
};

export const isUploadFileSafe = (file: formidable.File): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isAllowedFile(file)) return resolve(false);
    if (file.mimetype !== "image/svg+xml") return resolve(true);
    const fileContent = fs.readFileSync(getUploadedFilePath(file), "utf-8");
    const isSafe = fileContent.includes("<script>");
    resolve(!isSafe);
  });
};
