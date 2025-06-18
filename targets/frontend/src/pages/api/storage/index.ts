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

  const form = new IncomingForm({
    multiples: true,
    uploadDir, // Restrict uploads to this specific directory
    keepExtensions: true, // Keep file extensions for better file type identification
    maxFileSize: 10 * 1024 * 1024, // Limit file size to 10MB for additional security
  });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error("An error occurred while parsing the form");
      return res.status(400).json({ success: false });
    }
    // Safely handle files with proper type checking
    const fileValues = Object.values(files);
    const allFiles = fileValues
      .flat()
      .filter(
        (file): file is formidable.File =>
          file && typeof file === "object" && "filepath" in file
      );

    for (const file of allFiles) {
      const isSafe = await isUploadFileSafe(file);
      if (!isSafe) {
        console.error("Malicious code detected");
        return res
          .status(400)
          .json({ success: false, errorMessage: "Malicious code detected" });
      }
      const fileContent = fs.readFileSync(file.filepath);
      await uploadApiFiles(`${file.originalFilename}`, fileContent);
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
