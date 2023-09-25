import { NextApiRequest, NextApiResponse } from "next";
import { DocumentsController } from "src/api/documents";

export default async function publish(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const controller = new DocumentsController(req, res);
    return await controller.publish();
  }
}
