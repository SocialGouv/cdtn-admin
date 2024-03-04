import { inject, injectable } from "inversify";

import { S3Repository } from "../repositories";
import { getName, name } from "../utils";
import { AgreementsRepository } from "../repositories/agreements";
import { logger } from "@shared/utils";
import { Environment } from "@shared/types";

@injectable()
@name("AgreementsService")
export class AgreementsService {
  constructor(
    @inject(getName(S3Repository))
    private readonly s3Repo: S3Repository,
    @inject(getName(AgreementsRepository))
    private readonly agreementRepo: AgreementsRepository
  ) {}

  async uploadAgreements(
    environment: Environment,
    destinationFolder = process.env.AGREEMENTS_DESTINATION_FOLDER ?? "",
    destinationName = process.env.AGREEMENTS_DESTINATION_NAME ?? ""
  ): Promise<void> {
    const agreements = await this.agreementRepo.list();
    logger.info(`Upload agreement to ${destinationFolder}/${destinationName}`);
    await this.s3Repo.uploadAgreements(
      environment,
      JSON.stringify(agreements),
      destinationFolder,
      destinationName
    );
  }
}
