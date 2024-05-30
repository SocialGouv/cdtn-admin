import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpPost,
  request,
  response,
} from "inversify-express-utils";
import { Request, Response } from "express";
import { getContentGlossary } from "../ingester/glossary/addGlossary";
import {
  editContentOfContribution,
  fetchAllContributionsDocument,
} from "../services/contributions";

@controller("/glossary")
export class GlossaryController implements interfaces.Controller {
  @httpPost("/")
  index(@request() req: Request, @response() res: Response): Promise<string> {
    const content = (req.body as any).content;
    if (typeof content !== "string") {
      res.status(500).send("Invalid content");
    }
    return getContentGlossary(content);
  }

  @httpPost("/all")
  async all(@request() req: Request, @response() res: Response): Promise<any> {
    const contributions = await fetchAllContributionsDocument();
    for (let i = 0; i < contributions.length; i++) {
      const content = contributions[i].document.content;
      const item = getContentGlossary(content);
      await editContentOfContribution(contributions[i].cdtnId, {
        ...contributions[i].document,
        content: item,
      });
    }
  }
}
