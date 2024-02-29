import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { z } from "zod";

import { name } from "../../utils";

const Validator = z.object({
  data: z.string(),
  name: z.string(),
});

export type ValidatorUpload = z.infer<typeof Validator>;

@injectable()
@name("UploadMiddleware")
export class UploadMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = Validator.safeParse(req.body);
    if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error.issues });
    }
  }
}
