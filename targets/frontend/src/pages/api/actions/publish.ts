import { NextApiRequest, NextApiResponse } from "next";
import { DocumentsController } from "src/api/documents";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { publish } = new DocumentsController(req, res);
    await publish();
  }
}
