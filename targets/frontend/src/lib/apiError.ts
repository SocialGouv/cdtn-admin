import { NextApiResponse } from "next";
import { Boom } from "@hapi/boom";

export function createErrorFor(res: NextApiResponse) {
  return function toError({ output: { statusCode, payload } }: Boom) {
    res.status(statusCode).json(payload);
  };
}

export function serverError(
  res: NextApiResponse,
  { output: { statusCode, payload } }: Boom
) {
  return res.status(statusCode).json(payload);
}
