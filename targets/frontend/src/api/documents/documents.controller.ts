import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { ApiClient } from "../ApiClient";

import {
  DEFAULT_ERROR_500_MESSAGE,
  InvalidQueryError,
  NotFoundError,
} from "../ApiErrors";
import { DocumentsRepository, DocumentsService } from ".";
import { InformationsRepository } from "../informations";

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
    "x-hasura-user-id": z.string().uuid(),
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
        const { publish } = new DocumentsService(
          new InformationsRepository(client),
          new DocumentsRepository(client)
        );
        await publish(inputs.input.id, inputs.input.source);
        console.log();
        this.res.status(201).json({ cdtnId: "test" });
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        this.res.status(404).json({ message: error.message });
      }
      if (error instanceof InvalidQueryError) {
        this.res.status(400).json({ message: error.message });
      } else {
        console.log("error", error);
        this.res.status(500).json({
          message: DEFAULT_ERROR_500_MESSAGE,
        });
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
