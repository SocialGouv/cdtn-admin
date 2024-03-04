import { inject, injectable } from "inversify";

import { S3Repository } from "../repositories";
import { getName, name } from "../utils";
import { Environment } from "@shared/types";

@injectable()
@name("CopyContainerService")
export class CopyContainerService {
  constructor(
    @inject(getName(S3Repository))
    private readonly repo: S3Repository
  ) {}

  async runCopy(environment: Environment): Promise<void> {
    await this.repo.copyFolder(environment);
  }
}
