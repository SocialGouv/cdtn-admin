import { Environment } from "@shared/types";
import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { z } from "zod";

import { name } from "../../utils";

const ENVIRONMENT =
  process.env.NODE_ENV === "production"
    ? process.env.ENVIRONMENT ?? "dev"
    : "production";

const ValidatorCreateExportEsStatus = z.object({
  environment: z.nativeEnum(Environment),
  userId: z.string().uuid(),
});

export type ValidatorCreateExportEsStatusType = z.infer<
  typeof ValidatorCreateExportEsStatus
>;

@injectable()
@name("ExportEsRunMiddleware")
export class ExportEsRunMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = ValidatorCreateExportEsStatus.safeParse(req.body);
    if (ENVIRONMENT !== "production") {
      res.status(400).json({
        errors:
          "L'environnement est différent de celui géré par le process.env",
      });
    } else if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error.issues });
    }
  }
}
