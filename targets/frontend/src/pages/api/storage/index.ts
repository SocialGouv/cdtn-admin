typescript;

Collapse;

Wrap;

Run;

Copy;
import formidable, { IncomingForm } from "formidable";
import { isUploadFileSafe } from "src/lib/secu";
import { NextApiRequest, NextApiResponse } from "next";
import { getApiAllFiles, uploadApiFiles } from "src/lib/upload";
import fs from "fs";
import path from "path";
import os from "os";
import { fileTypeFromBuffer } from "file-type";
import sanitizeFilename from "sanitize-filename";

async function validateFileContent(file: formidable.File): Promise<boolean> {
  const buffer = fs.readFileSync(file.filepath);
  const fileType = await fileTypeFromBuffer(buffer);
  return fileType ? allowedFileTypes.includes(fileType.mime) : false;
}

function uploadFiles(req: NextApiRequest, res: NextApiResponse) {
  const uploadDir = path.join(os.tmpdir(), "cdtn-admin-uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o700 });
  }

  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".svg", ".pdf", ".docx"];

  const form = new IncomingForm({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 2 * 1024 * 1024, // Reduced to 2MB
    filter: ({ name, originalFilename, mimetype }) => {
      const hasValidMimeType = mimetype && allowedFileTypes.includes(mimetype);
      const hasValidExtension =
        originalFilename &&
        allowedExtensions.some((ext) =>
          originalFilename.toLowerCase().endsWith(ext.toLowerCase())
        );

      if (!hasValidMimeType || !hasValidExtension) {
        console.error(
          `Rejected file upload: ${name}, type: ${mimetype}, filename: ${originalFilename}, reason: Invalid MIME type or extension`
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
        // Validate file content
        const isContentValid = await validateFileContent(file);
        if (!isContentValid) {
          console.error("Invalid file content detected");
          fs.unlinkSync(file.filepath);
          return res.status(400).json({
            success: false,
            errorMessage: "Invalid file content detected",
          });
        }

        // Check for malicious content
        const isSafe = await isUploadFileSafe(file);
        if (!isSafe) {
          console.error("Malicious code detected");
          fs.unlinkSync(file.filepath);
          return res.status(400).json({
            success: false,
            errorMessage: "Malicious code detected",
          });
        }

        // Sanitize filename
        const sanitizedFilename = sanitizeFilename(
          file.originalFilename || "unknown"
        );
        const fileContent = fs.readFileSync(file.filepath);
        await uploadApiFiles(sanitizedFilename, fileContent);
        fs.unlinkSync(file.filepath);
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
