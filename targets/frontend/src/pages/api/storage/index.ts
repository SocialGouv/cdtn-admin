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

  // Define allowed file types with their corresponding extensions (whitelist approach)
  const allowedFileMap: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  };

  // Extract all allowed MIME types and extensions for easier access
  const allowedFileTypes = Object.keys(allowedFileMap);
  const allowedExtensions = Object.values(allowedFileMap).flat();

  // Function to validate file type based on actual content (magic numbers)
  const validateFileContent = (
    filepath: string,
    claimedMimeType?: string
  ): boolean => {
    try {
      const fileBuffer = fs.readFileSync(filepath);

      // Check file signatures (magic numbers)
      // JPEG: FF D8 FF
      if (
        fileBuffer[0] === 0xff &&
        fileBuffer[1] === 0xd8 &&
        fileBuffer[2] === 0xff
      ) {
        return claimedMimeType === "image/jpeg";
      }

      // PNG: 89 50 4E 47 0D 0A 1A 0A
      if (
        fileBuffer[0] === 0x89 &&
        fileBuffer[1] === 0x50 &&
        fileBuffer[2] === 0x4e &&
        fileBuffer[3] === 0x47 &&
        fileBuffer[4] === 0x0d &&
        fileBuffer[5] === 0x0a &&
        fileBuffer[6] === 0x1a &&
        fileBuffer[7] === 0x0a
      ) {
        return claimedMimeType === "image/png";
      }

      // PDF: 25 50 44 46
      if (
        fileBuffer[0] === 0x25 &&
        fileBuffer[1] === 0x50 &&
        fileBuffer[2] === 0x44 &&
        fileBuffer[3] === 0x46
      ) {
        return claimedMimeType === "application/pdf";
      }

      // For Office documents (docx), check for ZIP signature (they are ZIP-based formats)
      if (fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b) {
        const extension = path.extname(filepath).toLowerCase();
        return (
          extension === ".docx" &&
          claimedMimeType ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
      }

      return false;
    } catch (error) {
      console.error("Error validating file content:", error);
      return false;
    }
  };

  const form = new IncomingForm({
    multiples: true,
    uploadDir, // Restrict uploads to this specific directory
    keepExtensions: true, // Keep file extensions for better file type identification
    maxFileSize: 10 * 1024 * 1024, // Limit file size to 10MB for additional security
    filter: ({
      name,
      originalFilename,
      mimetype,
    }: {
      name: string | null;
      originalFilename: string | null;
      mimetype: string | null;
    }) => {
      // Reject if missing filename or mimetype
      if (!originalFilename || !mimetype) {
        console.error(`Rejected file upload: Missing filename or mimetype`);
        return false;
      }

      const fileExtension = path.extname(originalFilename).toLowerCase();

      // Check if the MIME type is allowed
      const hasValidMimeType = allowedFileTypes.includes(mimetype);

      // Check if the extension is allowed
      const hasValidExtension = allowedExtensions.includes(fileExtension);

      // Check if the extension matches the claimed MIME type
      const validExtensionsForMime = allowedFileMap[mimetype] || [];
      const extensionMatchesMime =
        validExtensionsForMime.includes(fileExtension);

      // Reject if ANY validation fails (using OR instead of AND)
      if (!hasValidMimeType || !hasValidExtension || !extensionMatchesMime) {
        console.error(
          `Rejected file upload: ${name}, type: ${mimetype}, filename: ${originalFilename}, ` +
            `validMime: ${hasValidMimeType}, validExt: ${hasValidExtension}, extMatchesMime: ${extensionMatchesMime}`
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
        // Get the MIME type from the file
        const mimeType = (file as any).mimetype || "";

        // Validate file content matches claimed MIME type
        const contentIsValid = validateFileContent(file.filepath, mimeType);
        if (!contentIsValid) {
          console.error(`File content doesn't match claimed type: ${mimeType}`);
          return res.status(400).json({
            success: false,
            errorMessage: "File content doesn't match claimed type",
          });
        }

        // Double-check file safety
        const isSafe = await isUploadFileSafe(file);
        if (!isSafe) {
          console.error("Malicious code detected");
          return res
            .status(400)
            .json({ success: false, errorMessage: "Malicious code detected" });
        }

        // Sanitize the original filename
        const originalFilename = (file as any).originalFilename;
        const sanitizedFilename = path.basename(originalFilename || "unknown");

        // Ensure the sanitized filename has a valid extension
        const fileExtension = path.extname(sanitizedFilename).toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          console.error(`Invalid file extension: ${fileExtension}`);
          return res.status(400).json({
            success: false,
            errorMessage: "Invalid file extension",
          });
        }

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
