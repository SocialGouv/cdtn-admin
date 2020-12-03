import Boom from "@hapi/boom";
import { IncomingForm } from "formidable";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { deleteBlob, getContainerBlobs, uploadBlob } from "src/lib/azure";

const { HASURA_GRAPHQL_JWT_SECRET } = process.env;
const jwtSecret = JSON.parse(HASURA_GRAPHQL_JWT_SECRET);

const errored = (res, err) => {
  console.log("Error is", err);
  res.status(400).json({ success: false });
};
const done = (res) => res.status(200).json({ success: true });

async function endPoint(req, res) {
  const apiError = createErrorFor(res);
  const { token } = req.headers;

  if (!token || !verify(token, jwtSecret.key, { algorithms: jwtSecret.type })) {
    return apiError(Boom.badRequest("wrong token"));
  }
  const { container, path } = req.query;

  if (req.method === "POST") {
    const form = new IncomingForm({ multiples: true });
    // we need to override the onPart method to directly
    // stream the data to azure
    let uploadingFilesNumber = 0;
    form.onPart = async function (part) {
      try {
        uploadingFilesNumber++;
        await uploadBlob(container, part);
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
    });
  } else if (req.method === "DELETE") {
    if (path) {
      await deleteBlob(container, path);
    }
    done(res);
  } else if (req.method === "GET") {
    res.json(await getContainerBlobs(container));
  }
}

export default endPoint;

// prevent uploads corruption
export const config = {
  api: {
    bodyParser: false,
  },
};
