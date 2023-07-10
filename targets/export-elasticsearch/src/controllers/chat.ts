import type { interfaces } from "inversify-express-utils";
import { controller, httpGet, queryParam } from "inversify-express-utils";
import { getName } from "../utils";
import { inject } from "inversify";
import { ChatService } from "../services";

@controller("/chat")
export class ChatController implements interfaces.Controller {
  constructor(
    @inject(getName(ChatService))
    private readonly service: ChatService
  ) {}

  @httpGet("/")
  async getServicePublic(
    @queryParam("question") question: string
  ): Promise<Record<string, any>> {
    if (!question) {
      return { error: "Missing question parameter" };
    }
    return await this.service.ask(question, "");
  }
}
