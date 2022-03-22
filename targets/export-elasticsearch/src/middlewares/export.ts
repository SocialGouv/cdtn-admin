import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";

import { CreateExportEsStatus } from "../schemas";
import { name } from "../utils";

@injectable()
@name("ExportEsRunMiddleware")
export class ExportEsRunMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = CreateExportEsStatus.safeParse(req.body);
    if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error });
    }
  }
}
