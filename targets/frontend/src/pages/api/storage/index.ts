import Boom from "@hapi/boom";
import { IncomingForm } from "formidable";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { isUploadFileSafe } from "src/lib/secu";
import * as stream from "stream";
import { NextApiRequest, NextApiResponse } from "next";
import { getApiAllFiles, uploadApiFiles } from "src/lib/upload";

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

const errored = (res: NextApiResponse, err: any) => {
  console.error("[storage]", err);
  res.status(400).json({ success: false });
};

const done = (res: NextApiResponse) => res.status(200).json({ success: true });

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

const isAllowedFile = (part: any) =>
  ALLOWED_EXTENSIONS.includes(part.name.toLowerCase().split(".").reverse()[0]);

function uploadFiles(req: NextApiRequest, res: NextApiResponse) {
  const form = new IncomingForm({ multiples: true });
  // we need to override the onPart method to directly
  // stream the data to azure
  let uploadingFilesNumber = 0;
  form.onPart = async function (part) {
    try {
      uploadingFilesNumber++;
      const streamCheckup: any = part.pipe(new stream.PassThrough());
      const streamUpload: any = part.pipe(new stream.PassThrough());
      streamUpload.name = part.name;
      streamUpload.mimetype = part.mimetype;

      const isSafe = await isUploadFileSafe(streamCheckup);
      if (!isSafe) {
        errored(res, "A malicious code was find in the upload");
      }
      if (isAllowedFile(part) && isSafe) {
        //TODO: a voir comment transformer le stream en file, voire faire de l'upload stream
        await uploadApiFiles("key", streamUpload);
      } else {
        console.error(
          "[storage]",
          `Skip upload of ${part.name}: forbidden type`
        );
      }
      --uploadingFilesNumber;
      if (uploadingFilesNumber === 0) {
        done(res);
      }
    } catch (err) {
      errored(res, err);
    }
  };
  form.parse(req, async (err) => {
    if (err) {
      errored(res, err);
      return;
    }
    if (!uploadingFilesNumber) {
      done(res);
    }
  });
}

async function getFiles(_req: NextApiRequest, res: NextApiResponse) {
  res.json(await getApiAllFiles());
}

export default endPoint;

// prevent uploads corruption
export const config = {
  api: {
    bodyParser: false,
  },
};
