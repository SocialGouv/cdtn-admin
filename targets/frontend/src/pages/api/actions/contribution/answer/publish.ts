import { NextApiRequest, NextApiResponse } from "next";
import { PublishAnswerController } from "../../../../../api/contribution/answer/publish/PublishAnswerController";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new PublishAnswerController(req, res);
  if (req.method === "POST") {
    await controller.publish();
  }
}
