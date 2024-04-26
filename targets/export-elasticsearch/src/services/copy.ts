import { inject, injectable } from "inversify";

import { S3Repository } from "../repositories";
import { getName, name } from "../utils";
import { Environment } from "@socialgouv/cdtn-types";
import { logger } from "@shared/utils";

@injectable()
@name("CopyContainerService")
export class CopyContainerService {
  constructor(
    @inject(getName(S3Repository))
    private readonly repo: S3Repository
  ) {}

  async runCopy(environment: Environment): Promise<void> {
    logger.info(
      `Preparing to copy folder for this environment : ${environment}`
    );
    await this.repo.copyFolder(environment);
    logger.info(`Folder has been copied 🚀`);
  }
}
