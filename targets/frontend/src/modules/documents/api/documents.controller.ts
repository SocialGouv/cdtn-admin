import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import {
  ApiClient,
  DEFAULT_ERROR_500_MESSAGE,
  InvalidQueryError,
  NotFoundError,
} from "src/lib/api";
import { DocumentsRepository, DocumentsService } from ".";
import { InformationsRepository } from "../../informations/api";
import { ContributionRepository } from "src/modules/contribution";
import { ModelRepository } from "../../models/api";

const inputSchema = z.object({
  id: z.string().uuid(),
  source: z.string(),
});

const actionSchema = z.object({
  action: z.object({
    name: z.string(),
  }),
  input: inputSchema,
  session_variables: z.object({
    "x-hasura-user-id": z.string().uuid().optional(),
    "x-hasura-role": z.string().optional(),
  }),
});

export class DocumentsController {
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
        const client = ApiClient.build(inputs.session_variables);
        const service = new DocumentsService(
          new InformationsRepository(client),
          new DocumentsRepository(client),
          new ContributionRepository(client)
          new ModelRepository(client),
        );
        const cdtnId = await service.publish(
          inputs.input.id,
          inputs.input.source
        );
        this.res.status(201).json({ cdtnId });
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.res.status(404).json({ message: error.message });
      } else {
        if (error instanceof InvalidQueryError) {
          this.res.status(400).json({ message: error.message });
        } else {
          this.res.status(400).json({
            message: DEFAULT_ERROR_500_MESSAGE,
          });
        }
      }
    }
  }

  checkInputs(): z.infer<typeof actionSchema> {
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
