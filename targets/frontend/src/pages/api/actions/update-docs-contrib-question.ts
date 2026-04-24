import { NextApiRequest, NextApiResponse } from "next";
import { QuestionsController } from "../../../modules/contribution/api/questions.controller";

export default async function updateDocsContribQuestion(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const controller = new QuestionsController(req, res);
    return await controller.updateUpdateQuestionDocuments();
  }
}
