import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { ContributionRepository } from "../../repository";
import { ApiClient } from "../../../ApiClient";
import { PublishAnswerService } from "./PublishAnswerService";
import {
  DEFAULT_ERROR_500_MESSAGE,
  InvalidQueryError,
  NotFoundError,
} from "../../../ApiErrors";

const inputSchema = z.object({
  answerId: z.string().uuid(),
});

const actionSchema = z.object({
  action: z.object({
    name: z.string(),
  }),
  input: inputSchema,
  session_variables: z.object({
    "x-hasura-user-id": z.string().uuid(),
  }),
});

export class PublishAnswerController {
  private readonly req: NextApiRequest;
  private readonly res: NextApiResponse;

  constructor(req: NextApiRequest, res: NextApiResponse) {
    this.req = req;
    this.res = res;
  }

  public async publish() {
    try {
      const inputs = this.checkInputs();

      if (inputs) {
        const contributionRepository = new ContributionRepository(
          ApiClient.build(inputs.session_variables)
        );
        const updateStatus = new PublishAnswerService(contributionRepository);
        await updateStatus.execute(
          inputs.input.answerId,
          inputs.session_variables["x-hasura-user-id"]
        );
        this.res.status(201).json({ cdtnId: "test" });
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.res.status(404).json({ message: error.message });
      }
      if (error instanceof InvalidQueryError) {
        this.res.status(400).json({ message: error.message });
      } else {
        this.res.status(500).json({
          message: DEFAULT_ERROR_500_MESSAGE,
        });
      }
    }
  }

  private checkInputs(): z.infer<typeof actionSchema> {
    const inputResult = actionSchema.safeParse(this.req.body);

    if (!inputResult.success) {
      throw new InvalidQueryError(
        inputResult.error.message,
        inputResult.error.errors
      );
    }

    return inputResult.data;
  }
}
