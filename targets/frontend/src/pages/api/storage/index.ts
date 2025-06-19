import formidable, { IncomingForm } from "formidable";
import { isUploadFileSafe } from "src/lib/secu";
import { NextApiRequest, NextApiResponse } from "next";
import { getApiAllFiles, uploadApiFiles } from "src/lib/upload";
import fs from "fs";
import path from "path";
import os from "os";

async function endPoint(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "POST":
      return uploadFiles(req, res);
    case "GET":
      return getFiles(req, res);
    default: {
      return res
        .status(400)
        .json({ success: false, errorMessage: `${req.method} not allowed` });
    }
  }
}

function uploadFiles(req: NextApiRequest, res: NextApiResponse) {
  // Create a secure, dedicated upload directory within the system's temp directory
  const uploadDir = path.join(os.tmpdir(), "cdtn-admin-uploads");

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Define allowed file types (whitelist approach)
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/json",
  ];

  // Define allowed file extensions as a fallback
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".pdf",
    ".txt",
    ".csv",
    ".docx",
    ".xlsx",
    ".json",
  ];

  const form = new IncomingForm({
    multiples: true,
    uploadDir, // Restrict uploads to this specific directory
    keepExtensions: true, // Keep file extensions for better file type identification
    maxFileSize: 10 * 1024 * 1024, // Limit file size to 10MB for additional security
    filter: ({ name, originalFilename, mimetype }) => {
      // Check if the file has a valid mime type
      const hasValidMimeType = mimetype && allowedFileTypes.includes(mimetype);

      // Check if the file has a valid extension as a fallback
      const hasValidExtension =
        originalFilename &&
        allowedExtensions.some((ext) =>
          originalFilename.toLowerCase().endsWith(ext)
        );

      // Reject the file if neither condition is met
      if (!hasValidMimeType && !hasValidExtension) {
        console.error(
          `Rejected file upload: ${name}, type: ${mimetype}, filename: ${originalFilename}`
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

    // Safely handle files with proper type checking
    const fileValues = Object.values(files);
    const allFiles = fileValues
      .flat()
      .filter(
        (file): file is formidable.File =>
          file && typeof file === "object" && "filepath" in file
      );

    if (allFiles.length === 0) {
      return res.status(400).json({
        success: false,
        errorMessage: "No valid files were uploaded",
      });
    }

    try {
      for (const file of allFiles) {
        // Double-check file safety
        const isSafe = await isUploadFileSafe(file);
        if (!isSafe) {
          console.error("Malicious code detected");
          return res
            .status(400)
            .json({ success: false, errorMessage: "Malicious code detected" });
        }

        // Sanitize the original filename
        const sanitizedFilename = path.basename(
          file.originalFilename || "unknown"
        );

        const fileContent = fs.readFileSync(file.filepath);
        await uploadApiFiles(sanitizedFilename, fileContent);

        // Clean up the temporary file
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

async function getFiles(_req: NextApiRequest, res: NextApiResponse) {
  const files = await getApiAllFiles();
  res.json(files);
}

export default endPoint;

// prevent uploads corruption
export const config = {
  api: {
    bodyParser: false,
  },
};
