import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpPost,
  request,
  requestParam,
} from "inversify-express-utils";
import { getName } from "../utils";
import { inject } from "inversify";
import { ChatService } from "../services";
import { ValidatorChatMiddleware, ValidatorChatType } from "./middlewares";
import { CollectionSlug } from "../type";

@controller("/chat")
export class ChatController implements interfaces.Controller {
  constructor(
    @inject(getName(ChatService))
    private readonly service: ChatService
  ) {}

  @httpPost("/:slug", getName(ValidatorChatMiddleware))
  async sendMessage(
    @request() req: Request,
    @requestParam("slug") slug: CollectionSlug
  ): Promise<Record<string, any>> {
    const bdy: ValidatorChatType = req.body as any;
    switch (slug) {
      case CollectionSlug.SERVICE_PUBLIC:
        return await this.service.askServicePublic(bdy);
      case CollectionSlug.CONTRIBUTION_GENERIC:
        return await this.service.askServicePublic(bdy);
      default:
        return { error: "Unknown slug" };
    }
  }
}
