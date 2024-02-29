import { inject, injectable } from "inversify";

import { S3Repository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name("CopyContainerService")
export class CopyContainerService {
  constructor(
    @inject(getName(S3Repository))
    private readonly repo: S3Repository
  ) {}

  async runCopy(): Promise<void> {
    await this.repo.copyFolderFromDraftToPublished();
  }
}
