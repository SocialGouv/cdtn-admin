import formidable, { IncomingForm } from "formidable";
import { isUploadFileSafe } from "src/lib/secu";
import { NextApiRequest, NextApiResponse } from "next";
import { getApiAllFiles, uploadApiFiles } from "src/lib/upload";
import fs from "fs";

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
  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error("An error occurred while parsing the form");
      return res.status(400).json({ success: false });
    }
    const allFiles = Object.values(files) as formidable.File[];
    for (let i = 0; i < allFiles.length; i++) {
      const file = allFiles[i];
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
