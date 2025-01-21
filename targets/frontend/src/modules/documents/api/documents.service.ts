import { DocumentsRepository } from "./documents.repository";
import { ConflictError, NotFoundError } from "src/lib/api/ApiErrors";
import { InformationsRepository } from "src/modules/informations";
import {
  ContributionRepository,
  mapContributionToDocument,
} from "src/modules/contribution";
import { ModelRepository } from "../../models/api";
import { generateContributionSlug } from "src/modules/contribution/generateSlug";
import { AgreementRepository } from "../../agreements/api";
import { SourceRoute } from "@socialgouv/cdtn-sources";
import pMap from "p-map";
import { mapAgreementToDocument } from "src/modules/agreements/mapAgreementToDocument";
import { mapInformationToDocument } from "src/modules/informations/mapInformationToDocument";
import { mapModelToDocument } from "src/modules/models/mapModelToDocument";
import { HasuraDocument } from "@socialgouv/cdtn-types";

export class DocumentsService {
  private readonly informationsRepository: InformationsRepository;
  private readonly modelRepository: ModelRepository;
  private readonly documentsRepository: DocumentsRepository;
  private readonly contributionRepository: ContributionRepository;
  private readonly agreementRepository: AgreementRepository;

  constructor(
    informationsRepository: InformationsRepository,
    documentsRepository: DocumentsRepository,
    contributionRepository: ContributionRepository,
    modelRepository: ModelRepository,
    agreementRepository: AgreementRepository
  ) {
    this.informationsRepository = informationsRepository;
    this.modelRepository = modelRepository;
    this.documentsRepository = documentsRepository;
    this.contributionRepository = contributionRepository;
    this.agreementRepository = agreementRepository;
  }

  public async publish(id: string, source: SourceRoute) {
    let document = await this.documentsRepository.fetch({
      source,
      initialId: id,
    });

    let postTreatment:
      | ((document: HasuraDocument<any>) => Promise<void>)
      | undefined = undefined;

    switch (source) {
      case "information":
        const information = await this.informationsRepository.fetchInformation(
          id
        );
        if (!information) {
          throw new NotFoundError({
            message: `No information found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        document = await mapInformationToDocument(information, document);
        break;
      case "contributions":
        const contribution = await this.contributionRepository.fetch(id);
        if (!contribution) {
          throw new NotFoundError({
            message: `No contribution found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        if (!document) {
          const contrib = await this.documentsRepository.fetchDocumentBySlug({
            slug: generateContributionSlug(
              contribution.agreement.id,
              contribution.question.content
            ),
            source,
          });
          if (contrib) {
            throw new ConflictError({
              message: `Le document ${contribution.question.content} existe déjà pour la convention collective ${contribution.agreement.id}. Vous devez lancer le script de migration avant de publier un document.`,
              name: "CONFLICT_ERROR",
              cause: null,
            });
          }
        }
        document = await mapContributionToDocument(
          contribution,
          document,
          async (questionId: string) => {
            return await this.contributionRepository.fetchGenericAnswer(
              questionId,
            );
          },
        );

        if (!contribution.cdtnId) {
          postTreatment = async (document) => {
            await this.contributionRepository.updateCdtnId(
              contribution.id,
              document.cdtn_id,
            );
          };
        }
        break;

      case "modeles_de_courriers":
        const model = await this.modelRepository.fetch(id);
        if (!model) {
          throw new NotFoundError({
            message: `No agreement found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        document = mapModelToDocument(model, document);
        break;

      case "conventions_collectives":
        const agreement = await this.agreementRepository.fetch(id);
        if (!agreement) {
          throw new NotFoundError({
            message: `No agreement found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        document = mapAgreementToDocument(agreement, document);
        break;

      default:
        throw new Error(`La source ${source} n'est pas implémentée`);
    }

    if (!document) {
      return await this.documentsRepository.remove(id);
    }

    const result = await this.documentsRepository.update(document);

    if (postTreatment) {
      await postTreatment(document);
    }

    return result;
  }

  public async publishAll(
    questionId: string,
    source: SourceRoute
  ): Promise<number> {
    switch (source) {
      case "contributions":
        const allContributions =
          await this.contributionRepository.fetchAllPublishedContributionsByQuestionId(
            questionId
          );
        await pMap(
          allContributions,
          async (contribution) => {
            await this.publish(contribution.id, source);
            console.log(`Contribution ${contribution.id} has been republished`);
          },
          { concurrency: 1 }
        );
        console.log(
          "All contributions that has been already published have been republished"
        );
        return allContributions.length;
      default:
        throw new Error(`La source ${source} n'est pas implémentée`);
    }
  }
}
