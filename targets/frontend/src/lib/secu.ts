import formidable from "formidable";
import fs from "fs";

export const ALLOWED_PNG = [".png"];
export const ALLOWED_JPG = [".jpg", ".jpeg"];
export const ALLOWED_SVG = [".svg"];
export const ALLOWED_PDF = [".pdf"];
export const ALLOWED_DOC = [".doc", ".docx"];

const ALLOWED_EXTENSIONS = [
  ...ALLOWED_PNG,
  ...ALLOWED_JPG,
  ...ALLOWED_SVG,
  ...ALLOWED_PDF,
  ...ALLOWED_DOC,
];

export const isAllowedFile = (file: formidable.File) => {
  const extension = file.originalFilename
    ?.toLowerCase()
    .split(".")
    .reverse()[0];
  if (!extension) return false;
  return ALLOWED_EXTENSIONS.includes("." + extension);
};

export const isUploadFileSafe = (file: formidable.File): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isAllowedFile(file)) resolve(false);
    if (file.mimetype !== "image/svg+xml") resolve(true);
    const fileContent = fs.readFileSync(file.filepath, "utf-8");
    const isSafe = fileContent.includes("<script>");
    resolve(!isSafe);
  });
};
