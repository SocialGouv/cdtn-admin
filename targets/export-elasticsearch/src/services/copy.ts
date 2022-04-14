import { inject, injectable } from "inversify";

import { AzureRepository } from "../repositories";
import { getName, name } from "../utils";

@injectable()
@name(CopyContainerService.name)
export class CopyContainerService {
  constructor(
    @inject(getName(AzureRepository))
    private readonly repo: AzureRepository
  ) {
    this.repo = new AzureRepository(
      process.env.AZ_ACCOUNT_NAME ?? "",
      process.env.AZ_ACCOUNT_KEY ?? "",
      process.env.AZ_URL ??
        `https://${process.env.AZ_ACCOUNT_NAME}.blob.core.windows.net`
    );
  }

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
