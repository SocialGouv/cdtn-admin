import { NextApiResponse } from "next";

type Output = {
  output: { statusCode: number; payload: any };
};

export function createErrorFor(res: NextApiResponse) {
  return function toError({ output: { statusCode, payload } }: Output) {
    res.status(statusCode).json(payload);
  };
}

export function serverError(
  res: NextApiResponse,
  { output: { statusCode, payload } }: Output
) {
  return res.status(statusCode).json(payload);
}
