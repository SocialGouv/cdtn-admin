import formidable from "formidable";
import fs from "fs";

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "gif",
  "png",
  "jpg",
  "jpeg",
  "svg",
  "xls",
  "xlsx",
  "ods",
  "odt",
];

const isAllowedFile = (file: formidable.File) => {
  const extension = file.originalFilename
    ?.toLowerCase()
    .split(".")
    .reverse()[0];
  if (!extension) return false;
  return ALLOWED_EXTENSIONS.includes(extension);
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
