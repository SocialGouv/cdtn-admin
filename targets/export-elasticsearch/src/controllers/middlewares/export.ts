import { Environment } from "@socialgouv/cdtn-types";
import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { z } from "zod";

import { name } from "../../utils";

const ValidatorReferenceValues = z.object({
  smicHourly: z.number().positive(),
});

const ValidatorCreateExportEsStatus = z.object({
  environment: z.nativeEnum(Environment),
  userId: z.string().uuid(),
  reference: ValidatorReferenceValues.optional(),
});

export type ReferenceValues = z.infer<typeof ValidatorReferenceValues>;

export type ValidatorCreateExportEsStatusType = z.infer<
  typeof ValidatorCreateExportEsStatus
>;

@injectable()
@name("ExportEsRunMiddleware")
export class ExportEsRunMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = ValidatorCreateExportEsStatus.safeParse(req.body);
    if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error.issues });
    }
  }
}
