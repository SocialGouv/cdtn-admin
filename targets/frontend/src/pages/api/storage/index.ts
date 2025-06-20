import formidable, { IncomingForm } from "formidable";
import { isUploadFileSafe } from "src/lib/secu";
import { NextApiRequest, NextApiResponse } from "next";
import { uploadApiFiles } from "src/lib/upload";
import { promises as fsPromises } from "fs";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from "file-type";
import sanitizeFilename from "sanitize-filename";

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
const deniedExtensions = [
  ".exe",
  ".js",
  ".bat",
  ".sh",
  ".cmd",
  ".php",
  ".py",
  ".jar",
];
const deniedMimeTypes = [
  "application/javascript",
  "text/javascript",
  "application/x-sh",
  "application/x-executable",
];
const fileTypeMap: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function isExtensionAllowed(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext) && !deniedExtensions.includes(ext);
}

function isMimeTypeAllowed(mimetype: string): boolean {
  return (
    allowedFileTypes.includes(mimetype) && !deniedMimeTypes.includes(mimetype)
  );
}

async function validateFileContent(file: formidable.File): Promise<boolean> {
  const buffer = await fsPromises.readFile(file.filepath);
  const uint8Array = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength
  );
  const fileType = await fileTypeFromBuffer(uint8Array);

  if (!fileType || !allowedFileTypes.includes(fileType.mime)) {
    console.error(`Invalid file content for ${file.originalFilename}`);
    return false;
  }

  const extension = path.extname(file.originalFilename || "").toLowerCase();
  const expectedMime = fileTypeMap[extension];
  if (!expectedMime || fileType.mime !== expectedMime) {
    console.error(
      `MIME type mismatch for ${file.originalFilename}: expected ${expectedMime}, got ${fileType.mime}`
    );
    return false;
  }

  return true;
}

async function uploadFiles(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir = path.join(os.tmpdir(), "cdtn-admin-uploads");

  try {
    await fsPromises.access(uploadDir);
  } catch {
    await fsPromises.mkdir(uploadDir, { recursive: true, mode: 0o700 });
  }

  const form = new IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024,
    filter: ({ name, originalFilename, mimetype }) => {
      if (!originalFilename || !mimetype) {
        return false;
      }
      const extAllowed = isExtensionAllowed(originalFilename);
      const mimeAllowed = isMimeTypeAllowed(mimetype);

      if (!extAllowed || !mimeAllowed) {
        console.error(
          `Rejected file upload: ${name}, type: ${mimetype}, filename: ${originalFilename}, reason: disallowed extension or MIME type`
        );
        return false;
      }

      return true;
    },
  });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error("An error occurred while parsing the form", err);
      return res.status(400).json({
        success: false,
        errorMessage: err.message || "Error processing upload",
      });
    }

    const fileValues = Object.values(files)
      .flat()
      .filter(
        (file): file is formidable.File =>
          file && typeof file === "object" && "filepath" in file
      );

    if (fileValues.length === 0) {
      return res.status(400).json({
        success: false,
        errorMessage: "No valid files were uploaded",
      });
    }

    try {
      for (const file of fileValues) {
        const isContentValid = await validateFileContent(file);
        if (!isContentValid) {
          console.error("Invalid file content detected");
          await fsPromises.unlink(file.filepath);
          return res.status(400).json({
            success: false,
            errorMessage: "Invalid file content detected",
          });
        }

        // isUploadFileSafe performs additional security checks, including antivirus scanning.
        const isSafe = await isUploadFileSafe(file);
        if (!isSafe) {
          console.error("Malicious code detected");
          await fsPromises.unlink(file.filepath);
          return res.status(400).json({
            success: false,
            errorMessage: "Malicious code detected",
          });
        }

        const sanitizedFilename = sanitizeFilename(
          file.originalFilename || "unknown"
        );
        const fileContent = await fsPromises.readFile(file.filepath);
        await uploadApiFiles(sanitizedFilename, fileContent);
        await fsPromises.unlink(file.filepath);
      }
    } catch (error) {
      console.error("Error processing uploaded files:", error);
      return res.status(500).json({
        success: false,
        errorMessage: "Error processing uploaded files",
      });
    }
    res.status(200).json({ success: true });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, errorMessage: "Method not allowed" });
  }

  return uploadFiles(req, res);
}
