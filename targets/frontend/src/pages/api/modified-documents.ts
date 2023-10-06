import { NextApiRequest, NextApiResponse } from "next";
import { DocumentsController } from "src/modules/documents";

export default async function modifiedDocuments(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const controller = new DocumentsController(req, res);
    return await controller.getUpdatedAfter();
  }
}
