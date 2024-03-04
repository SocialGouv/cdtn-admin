import Boom from "@hapi/boom";
import formidable, { IncomingForm } from "formidable";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { isUploadFileSafe } from "src/lib/secu";
import { NextApiRequest, NextApiResponse } from "next";
import { getApiAllFiles, uploadApiFiles } from "src/lib/upload";
import fs from "fs";

const jwtSecret = JSON.parse(
  process.env.HASURA_GRAPHQL_JWT_SECRET ??
    '{"type":"HS256","key":"a_pretty_long_secret_key_that_should_be_at_least_32_char"}'
);

async function endPoint(req: NextApiRequest, res: NextApiResponse) {
  const apiError = createErrorFor(res);
  const { jwt: token } = req.cookies;

  if (!token || !verify(token, jwtSecret.key, { algorithms: jwtSecret.type })) {
    return apiError(Boom.badRequest("wrong token"));
  }

  switch (req.method) {
    case "POST":
      return uploadFiles(req, res);
    case "GET":
      return getFiles(req, res);
    default: {
      res.setHeader("Allow", "GET, POST");
      apiError(Boom.methodNotAllowed(`${req.method} not allowed`));
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
        console.error("A malicious code was find in the upload");
        return res.status(400).json({ success: false });
      }
      const fileContent = fs.readFileSync(file.filepath);
      await uploadApiFiles(`${file.originalFilename}`, fileContent);
    }
  });
  res.status(200).json({ success: true });
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
