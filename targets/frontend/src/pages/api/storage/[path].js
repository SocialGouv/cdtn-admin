import Boom from "@hapi/boom";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { deleteBlob } from "src/lib/azure";
import { HASURA_GRAPHQL_JWT_SECRET } from "../../../config";

const container = process.env.STORAGE_CONTAINER ?? "cdtn-dev";
const jwtSecret = JSON.parse(HASURA_GRAPHQL_JWT_SECRET);

export default async function deleteFiles(req, res) {
  const apiError = createErrorFor(res);
  const { token } = req.headers;

  if (!token || !verify(token, jwtSecret.key, { algorithms: jwtSecret.type })) {
    return apiError(Boom.badRequest("wrong token"));
  }
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return apiError(Boom.methodNotAllowed(`${req.method} method not allowed`));
  }
  const { path } = req.query;

  await deleteBlob(container, path);
  res.status(200).json({ success: true });
}
