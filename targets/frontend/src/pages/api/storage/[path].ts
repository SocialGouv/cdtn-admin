import Boom from "@hapi/boom";
import { NextApiRequest, NextApiResponse } from "next";
import { createErrorFor } from "src/lib/apiError";
import { deleteApiFile } from "src/lib/upload";

export default async function deleteFiles(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiError = createErrorFor(res);
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return apiError(Boom.methodNotAllowed(`${req.method} method not allowed`));
  }
  const { path } = req.query;

  if (typeof path !== "string") {
    return apiError(Boom.badRequest("path is not a string"));
  }

  await deleteApiFile(path);

  res.status(200).json({ success: true });
}
