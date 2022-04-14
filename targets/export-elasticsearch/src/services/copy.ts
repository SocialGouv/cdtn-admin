import { inject, injectable } from "inversify";

import { AzureRepository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name("CopyContainerService")
export class CopyContainerService {
  constructor(
    @inject(getName(AzureRepository))
    private readonly repo: AzureRepository
  ) {}

  async runCopy(
    sourceContainerName = process.env.SOURCE_CONTAINER_COPY ?? "",
    destinationContainerName = process.env.DESTINATION_CONTAINER_COPY ?? ""
  ): Promise<void> {
    await this.repo.copyBucket(sourceContainerName, destinationContainerName);
    await this.repo.setSamePolicy(
      sourceContainerName,
      destinationContainerName
    );
  }
}
