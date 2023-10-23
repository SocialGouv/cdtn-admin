import Boom from "@hapi/boom";
import { verify } from "jsonwebtoken";
import { createErrorFor } from "src/lib/apiError";
import { deleteBlob } from "src/lib/azure";

const container = process.env.STORAGE_CONTAINER ?? "cdtn-dev";
const jwtSecret = JSON.parse(
  process.env.HASURA_GRAPHQL_JWT_SECRET ??
    '{"type":"HS256","key":"a_pretty_long_secret_key_that_should_be_at_least_32_char"}'
);

export default async function deleteFiles(req, res) {
  const apiError = createErrorFor(res);
  const { jwt: token } = req.cookies;

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
