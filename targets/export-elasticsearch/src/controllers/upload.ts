import { Request, Response } from "express";
import { inject } from "inversify";
import type { interfaces } from "inversify-express-utils";
import {
  controller,
  httpGet,
  httpDelete,
  httpPost,
  queryParam,
  request,
  response,
} from "inversify-express-utils";

import { getName } from "../utils";
import type { ValidatorUpload } from "./middlewares";
import { UploadMiddleware } from "./middlewares";
import { S3Repository } from "../repositories";

@controller("/upload")
export class UploadController implements interfaces.Controller {
  constructor(
    //TODO: utiliser un service au lieu d'un repo
    @inject(getName(S3Repository))
    private readonly repo: S3Repository
  ) {}

  @httpPost("/", getName(UploadMiddleware))
  async post(
    @request() req: Request,
    @response() res: Response
  ): Promise<boolean> {
    const body: ValidatorUpload = req.body;
    res.status(202);
    await this.repo.uploadFile(
      body.data,
      process.env.BUCKET_DEFAULT_FOLDER ?? "default",
      body.name
    );
    return true;
  }

  @httpGet("/")
  async get(@queryParam("key") key?: string): Promise<string> {
    if (!key) {
      return Promise.reject("Key is required");
    }
    return this.repo.getFile(
      key,
      process.env.BUCKET_DEFAULT_FOLDER ?? "default",
      true
    );
  }

  @httpDelete("/")
  async delete(@queryParam("key") key?: string): Promise<boolean> {
    if (!key) {
      return Promise.reject("Key is required");
    }
    await this.repo.deleteFile(
      process.env.BUCKET_DEFAULT_FOLDER ?? "default",
      key
    );
    return true;
  }
}
