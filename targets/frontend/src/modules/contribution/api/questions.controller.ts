import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { ApiClient, InvalidQueryError, NotFoundError } from "src/lib/api";
import { ContributionRepository } from "src/modules/contribution";
import { QuestionsService } from "./questions.service";
import { DocumentsRepository } from "src/modules/documents";

const inputUpdateQuestionDocuments = z.object({
  questionId: z.string(),
});

const actionUpdateQuestionDocuments = z.object({
  action: z.object({
    name: z.string(),
  }),
  input: inputUpdateQuestionDocuments,
  session_variables: z.object({
    "x-hasura-user-id": z.string().uuid().optional(),
    "x-hasura-role": z.string().optional(),
  }),
});

export class QuestionsController {
  private readonly req: NextApiRequest;
  private readonly res: NextApiResponse;

  constructor(req: NextApiRequest, res: NextApiResponse) {
    this.req = req;
    this.res = res;
  }

  public async updateUpdateQuestionDocuments() {
    try {
      const inputs = this.checkInputsUpdateQuestionDocuments();

      if (inputs) {
        const client = ApiClient.build(inputs.session_variables);
        const service = new QuestionsService(
          new DocumentsRepository(client),
          new ContributionRepository(client)
        );
        await service.updateDocuments(inputs.input.questionId);
        this.res.status(200).json({ count: true });
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof NotFoundError) {
      this.res.status(404).json({ message: error.message });
    } else if (error instanceof InvalidQueryError) {
      this.res.status(400).json({ message: error.message });
    } else {
      this.res.status(500).json({
        message: error.message,
      });
    }
  }

  private checkInputsUpdateQuestionDocuments(): z.infer<
    typeof actionUpdateQuestionDocuments
  > {
    const inputResult = actionUpdateQuestionDocuments.safeParse(this.req.body);

    if (!inputResult.success) {
      throw new InvalidQueryError(
        inputResult.error.message,
        inputResult.error.errors
      );
    }

    return inputResult.data;
  }
}
