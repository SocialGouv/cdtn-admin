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

  private async handleInformationSource(
    id: string,
    document: HasuraDocument<any> | undefined
  ) {
    const information = await this.informationsRepository.fetchInformation(id);
    if (!information) {
      throw new NotFoundError({
        message: `No information found with id ${id}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }
    return mapInformationToDocument(information, document);
  }

  private async handleContributionSource(
    id: string,
    document: HasuraDocument<any> | undefined,
    source: SourceRoute
  ) {
    const contribution = await this.contributionRepository.fetch(id);
    if (!contribution) {
      throw new NotFoundError({
        message: `No contribution found with id ${id}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }

    // Check for existing document with same slug
    if (!document) {
      const slug = generateContributionSlug(
        contribution.agreement.id,
        contribution.question.content
      );
      const contrib = await this.documentsRepository.fetchDocumentBySlug({
        slug,
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

    // Map contribution to document
    const mappedDocument = await mapContributionToDocument(
      contribution,
      document,
      async (questionId: string) => {
        return this.contributionRepository.fetchGenericAnswer(questionId);
      }
    );

    // Handle CDTN ID updates
    let postTreatment = undefined;
    if (!mappedDocument) {
      await this.contributionRepository.updateCdtnId(contribution.id, null);
    } else if (!contribution.cdtnId) {
      postTreatment = async (doc: HasuraDocument<any>) => {
        await this.contributionRepository.updateCdtnId(
          contribution.id,
          doc.cdtn_id
        );
      };
    }

    return { document: mappedDocument, postTreatment };
  }

  private async handleModelSource(
    id: string,
    document: HasuraDocument<any> | undefined
  ) {
    const model = await this.modelRepository.fetch(id);
    if (!model) {
      throw new NotFoundError({
        message: `No model found with id ${id}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }
    return mapModelToDocument(model, document);
  }

  private async handleAgreementSource(
    id: string,
    document: HasuraDocument<any> | undefined
  ) {
    const agreement = await this.agreementRepository.fetch(id);
    if (!agreement) {
      throw new NotFoundError({
        message: `No agreement found with id ${id}`,
        name: "NOT_FOUND",
        cause: null,
      });
    }
    return mapAgreementToDocument(agreement, document);
  }

  public async publish(id: string, source: SourceRoute) {
    // Fetch existing document
    let document = await this.documentsRepository.fetch({
      source,
      initialId: id,
    });

    let postTreatment = undefined;

    // Process document based on source type
    if (source === "information") {
      document = await this.handleInformationSource(id, document);
    } else if (source === "contributions") {
      const _result = await this.handleContributionSource(id, document, source);
      document = _result.document;
      postTreatment = _result.postTreatment;
    } else if (source === "modeles_de_courriers") {
      document = await this.handleModelSource(id, document);
    } else if (source === "conventions_collectives") {
      document = await this.handleAgreementSource(id, document);
    } else {
      throw new Error(`La source ${source} n'est pas implémentée`);
    }

    // Handle document removal if needed
    if (!document) {
      return this.documentsRepository.remove(id);
    }

    // Update document and apply post-treatment if needed
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
    if (source === "contributions") {
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
    } else {
      throw new Error(`La source ${source} n'est pas implémentée`);
    }
  }
}
