import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { z } from "zod";

import { name } from "../../utils";

const ValidatorCreateGlossary = z.object({
  content: z.string(),
});

export type ValidatorCreateGlossaryType = z.infer<
  typeof ValidatorCreateGlossary
>;

@injectable()
@name("GlossaryMiddleware")
export class GlossaryMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = ValidatorCreateGlossary.safeParse(req.body);
    if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error.issues });
    }
  }
}
