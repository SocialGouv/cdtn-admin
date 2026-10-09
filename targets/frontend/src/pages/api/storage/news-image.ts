import formidable, { IncomingForm } from "formidable";
import { isUploadFileSafe } from "src/lib/secu";
import { NextApiRequest, NextApiResponse } from "next";
import { apiFileExists, uploadApiFiles } from "src/lib/upload";
import fs from "fs";
import {
  NEWS_IMAGE_ACCEPT,
  NEWS_IMAGE_MAX_BYTES,
} from "src/modules/news/image";
import {
  buildNewsImageBaseName,
  findAvailableNewsImageKey,
} from "src/modules/news/api/newsImageKey";

const FORMAT_ERROR =
  "Format non accepté. Formats attendus : WebP, JPEG ou PNG.";

const endPoint = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res
      .status(400)
      .json({ success: false, errorMessage: `${req.method} not allowed` });
  }
  return uploadNewsImage(req, res);
};

function uploadNewsImage(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({
    multiples: false,
    maxFileSize: NEWS_IMAGE_MAX_BYTES,
  });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("An error occurred while parsing the form", err);
      return res.status(400).json({
        success: false,
        errorMessage: "Fichier invalide ou trop lourd (5 Mo maximum)",
      });
    }
    const title = String(
      (Array.isArray(fields.title) ? fields.title[0] : fields.title) ?? ""
    );
    const file = (Array.isArray(files.file) ? files.file[0] : files.file) as
      | formidable.File
      | undefined;
    if (!file) {
      return res
        .status(400)
        .json({ success: false, errorMessage: "Aucun fichier reçu" });
    }
    const extension =
      file.originalFilename?.toLowerCase().split(".").pop() ?? "";
    if (
      !Object.values(NEWS_IMAGE_ACCEPT)
        .flat()
        .includes("." + extension) ||
      !Object.keys(NEWS_IMAGE_ACCEPT).includes(file.mimetype ?? "") ||
      !(await isUploadFileSafe(file))
    ) {
      return res
        .status(400)
        .json({ success: false, errorMessage: FORMAT_ERROR });
    }
    try {
      const key = await findAvailableNewsImageKey(
        buildNewsImageBaseName(title),
        extension,
        apiFileExists
      );
      await uploadApiFiles(key, fs.readFileSync(file.filepath));
      res.status(200).json({ success: true, key });
    } catch (error) {
      console.error("An error occurred while uploading the news image", error);
      res.status(500).json({
        success: false,
        errorMessage: "Erreur lors de l'envoi de l'image",
      });
    }
  });
}

export default endPoint;

// prevent uploads corruption
export const config = {
  api: {
    bodyParser: false,
  },
};
