import type { Documents } from "@shared/types";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import { controller, httpGet, queryParam } from "inversify-express-utils";

import { DocumentsService } from "../services";
import { getName } from "../utils";

@controller("/documents")
export class DocumentsController implements interfaces.Controller {
  constructor(
    @inject(getName(DocumentsService))
    private readonly service: DocumentsService
  ) {}

  @httpGet("/updated")
  async getDocumentsUpdatedGte(
    @queryParam("gteDate") gteDate: string
  ): Promise<Documents[]> {
    let dt = new Date(gteDate);
    if (isNaN(dt.getTime())) {
      dt = new Date();
    }
    return this.service.getDocumentsUpdatedGte(dt);
  }
}
