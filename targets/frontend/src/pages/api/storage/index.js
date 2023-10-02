import Boom from "@hapi/boom";
import { IncomingForm } from "formidable";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { getContainerBlobs, uploadBlob } from "src/lib/azure";
import { isUploadFileSafe } from "src/lib/secu";
import * as stream from "stream";
import { HASURA_GRAPHQL_JWT_SECRET } from "../../../config";

const container = process.env.STORAGE_CONTAINER ?? "cdtn-dev";
const jwtSecret = JSON.parse(HASURA_GRAPHQL_JWT_SECRET);

async function endPoint(req, res) {
  const apiError = createErrorFor(res);
  const { token } = req.headers;

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

const errored = (res, err) => {
  console.error("[storage]", err);
  res.status(400).json({ success: false });
};

const done = (res) => res.status(200).json({ success: true });

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

const isAllowedFile = (part) =>
  ALLOWED_EXTENSIONS.includes(part.name.toLowerCase().split(".").reverse()[0]);

function uploadFiles(req, res) {
  const form = new IncomingForm({ multiples: true });
  // we need to override the onPart method to directly
  // stream the data to azure
  let uploadingFilesNumber = 0;
  form.onPart = async function (part) {
    try {
      uploadingFilesNumber++;
      const streamCheckup = part.pipe(new stream.PassThrough());
      const streamUpload = part.pipe(new stream.PassThrough());
      streamUpload.name = part.name;
      streamUpload.mimetype = part.mimetype;

      const isSafe = await isUploadFileSafe(streamCheckup);
      if (!isSafe) {
        errored(res, "A malicious code was find in the upload");
      }
      if (isAllowedFile(part) && isSafe) {
        await uploadBlob(container, streamUpload);
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

async function getFiles(req, res) {
  res.json(await getContainerBlobs(container));
}

export default endPoint;

// prevent uploads corruption
export const config = {
  api: {
    bodyParser: false,
  },
};
