import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";

import { name } from "../../utils";
import { CreateExportEsStatus } from "../schemas";

@injectable()
@name("ExportEsRunMiddleware")
export class ExportEsRunMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = CreateExportEsStatus.safeParse(req.body);
    if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error.issues });
    }
  }
}
