import type { interfaces } from "inversify-express-utils";
import { controller, httpPost, request } from "inversify-express-utils";
import { getName } from "../utils";
import { inject } from "inversify";
import { ChatService } from "../services";
import { ValidatorChatMiddleware, ValidatorChatType } from "./middlewares";

@controller("/chat")
export class ChatController implements interfaces.Controller {
  constructor(
    @inject(getName(ChatService))
    private readonly service: ChatService
  ) {}

  @httpPost("/", getName(ValidatorChatMiddleware))
  async sendMessage(@request() req: Request): Promise<Record<string, any>> {
    const bdy: ValidatorChatType = req.body as any;
    return await this.service.ask(bdy.question, bdy.history);
  }
}
