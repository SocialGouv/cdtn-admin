import type { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { z } from "zod";

import { name } from "../../utils";

const ValidatorChat = z.object({
  question: z.string(),
  history: z.array(
    z.object({
      role: z.enum(["user", "system", "assistant"]),
      content: z.string(),
    })
  ),
  idcc: z.string().optional(),
});

export type ValidatorChatType = z.infer<typeof ValidatorChat>;

@injectable()
@name("ValidatorChatMiddleware")
export class ValidatorChatMiddleware extends BaseMiddleware {
  public handler(req: Request, res: Response, next: NextFunction): void {
    const parse = ValidatorChat.safeParse(req.body);
    if (parse.success) {
      next();
    } else {
      res.status(400).json({ errors: parse.error.issues });
    }
  }
}
