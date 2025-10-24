import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { ApiClient, InvalidQueryError, NotFoundError } from "src/lib/api";
import { DocumentsRepository, DocumentsService } from ".";
import { InformationsRepository } from "../../informations";
import { ContributionRepository } from "src/modules/contribution";
import { ModelRepository } from "../../models/api";
import { AgreementRepository } from "../../agreements/api";
import { InfographicRepository } from "../../infographics/api";

const inputSchema = z.object({
  id: z.string(),
  source: z.enum([
    "information",
    "modeles_de_courriers",
    "contributions",
    "conventions_collectives",
    "infographies"
  ])
});

const inputSchemaAll = z.object({
  questionId: z.string(),
  source: z.enum(["contributions"])
});

const actionSchema = z.object({
  action: z.object({
    name: z.string()
  }),
  input: inputSchema,
  session_variables: z.object({
    "x-hasura-user-id": z.string().uuid().optional(),
    "x-hasura-role": z.string().optional()
  })
});

const actionSchemaAll = z.object({
  action: z.object({
    name: z.string()
  }),
  input: inputSchemaAll,
  session_variables: z.object({
    "x-hasura-user-id": z.string().uuid().optional(),
    "x-hasura-role": z.string().optional()
  })
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
          new ContributionRepository(client),
          new ModelRepository(client),
          new AgreementRepository(client),
          new InfographicRepository(client)
        );
        const cdtnId = await service.publish(
          inputs.input.id,
          inputs.input.source
        );
        this.res.status(201).json({ cdtnId });
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  public async publishAll() {
    try {
      const inputs = this.checkInputsAll();

      if (inputs) {
        const client = ApiClient.build(inputs.session_variables);
        const service = new DocumentsService(
          new InformationsRepository(client),
          new DocumentsRepository(client),
          new ContributionRepository(client),
          new ModelRepository(client),
          new AgreementRepository(client),
          new InfographicRepository(client)
        );
        await service.publishAll(inputs.input.questionId, inputs.input.source);
        this.res.status(200).json({ count: true });
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  handleError(error: any) {
    if (error instanceof NotFoundError) {
      this.res.status(404).json({ message: error.message });
    } else {
      if (error instanceof InvalidQueryError) {
        this.res.status(400).json({ message: error.message });
      } else {
        this.res.status(400).json({
          message: error.message
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

  checkInputsAll(): z.infer<typeof actionSchemaAll> {
    const inputResult = actionSchemaAll.safeParse(this.req.body);

    if (!inputResult.success) {
      throw new InvalidQueryError(
        inputResult.error.message,
        inputResult.error.errors
      );
    }

    return inputResult.data;
  }
}
