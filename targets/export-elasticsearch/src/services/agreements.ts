import { inject, injectable } from "inversify";

import { AzureRepository } from "../repositories";
import { getName, name } from "../utils";
import { AgreementsRepository } from "../repositories/agreements";
import { logger } from "@shared/utils";

@injectable()
@name("AgreementsService")
export class AgreementsService {
  constructor(
    @inject(getName(AzureRepository))
    private readonly azureRepo: AzureRepository,
    @inject(getName(AgreementsRepository))
    private readonly agreementRepo: AgreementsRepository
  ) {}

  async uploadAgreements(
    destinationContainer = process.env.AGREEMENTS_DESTINATION_CONTAINER ?? "",
    destinationName = process.env.AGREEMENTS_DESTINATION_NAME ?? ""
  ): Promise<void> {
    const agreements = await this.agreementRepo.list();
    logger.info(
      `Upload agreement to ${destinationContainer}/${destinationName}`
    );
    await this.azureRepo.uploadAgreements(
      JSON.stringify(agreements),
      destinationContainer,
      destinationName
    );
  }
}
