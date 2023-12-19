import { DocumentsRepository } from "./documents.repository";
import {
  ConflictError,
  MissingDocumentError,
  NotFoundError,
} from "src/lib/api/ApiErrors";
import { Information, InformationsRepository } from "src/modules/informations";
import { format, parseISO } from "date-fns";
import { generateCdtnId, generateInitialId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import {
  ContributionRepository,
  mapContributionToDocument,
} from "src/modules/contribution";
import { ModelRepository } from "../../models/api";
import { Model } from "../../models";
import { Document } from "@shared/types";
import { generateContributionSlug } from "src/modules/contribution/generateSlug";

export class DocumentsService {
  private readonly informationsRepository: InformationsRepository;
  private readonly modelRepository: ModelRepository;
  private readonly documentsRepository: DocumentsRepository;
  private readonly contributionRepository: ContributionRepository;

  constructor(
    informationsRepository: InformationsRepository,
    documentsRepository: DocumentsRepository,
    contributionRepository: ContributionRepository,
    modelRepository: ModelRepository
  ) {
    this.informationsRepository = informationsRepository;
    this.modelRepository = modelRepository;
    this.documentsRepository = documentsRepository;
    this.contributionRepository = contributionRepository;
  }

  private mapInformationToDocument(
    data: Information,
    document?: Document<any>
  ): Document<any> {
    return {
      cdtn_id: document?.cdtn_id ?? generateCdtnId(data.title),
      initial_id: data.id ?? generateInitialId(),
      source: "information",
      meta_description: data.metaDescription ?? data.description,
      title: data.title,
      text: data.title,
      slug: document?.slug ?? slugify(data.title),
      is_searchable: document ? document.is_searchable : true,
      is_available: true,
      document: {
        date: data.updatedAt
          ? format(new Date(data.updatedAt), "dd/MM/yyyy")
          : undefined,
        intro: data.intro,
        description: data.description,
        sectionDisplayMode: data.sectionDisplayMode,
        dismissalProcess: data.dismissalProcess,
        references: data.references.length
          ? [
              {
                label: data.referenceLabel,
                links: data.references,
              },
            ]
          : undefined,
        contents: data.contents.map(
          ({ name, title, blocks, references, referenceLabel }) => {
            return {
              name,
              title,
              blocks: blocks.map((block) => {
                return {
                  type: block.type,
                  ...(block.type === "content"
                    ? {
                        title: block.content,
                      }
                    : { markdown: block.content }),
                  ...(block.type === "graphic"
                    ? {
                        size: block.file?.size,
                        imgUrl: block.img?.url,
                        altText: block.img?.altText,
                        fileUrl: block.file?.url,
                      }
                    : {}),
                  ...(block.type === "content"
                    ? {
                        blockDisplayMode: block.contentDisplayMode,
                        contents: block.contents?.length
                          ? block.contents.map(({ document }) => {
                              return {
                                title: document.title,
                                cdtnId: document.cdtnId,
                                source: document.source,
                              };
                            })
                          : undefined,
                      }
                    : {}),
                };
              }),
              references: references?.length
                ? [
                    {
                      label: referenceLabel,
                      links: references,
                    },
                  ]
                : undefined,
            };
          }
        ),
      },
    };
  }

  private mapModelToDocument(
    data: Model,
    document?: Document<any>
  ): Document<any> {
    return {
      cdtn_id: document?.cdtn_id ?? generateCdtnId(data.title),
      initial_id: data.id,
      source: "modeles_de_courriers",
      meta_description: data.metaDescription,
      title: data.title,
      text: data.description,
      slug: document?.slug ?? slugify(data.title),
      is_searchable: document ? document.is_searchable : true,
      is_available: true,
      document: {
        meta_title: data.metaTitle,
        type: data.type,
        date: format(parseISO(data.updatedAt), "dd/MM/yyyy"),
        author: "Ministère du Travail",
        references: data.legiReferences
          .map((item) => ({
            url: `https://www.legifrance.gouv.fr/codes/article_lc/${item.legiArticle.cid}`,
            title: item.legiArticle.label,
            type: "external",
          }))
          .concat(
            data.otherReferences.map((item) => ({
              url: item.url ?? "",
              title: item.label,
              type: "external",
            }))
          ),
        description: data.description,
        filename: data.file.url,
        fileUrl: `https://cdtn.azure.com/${data.file.url}`,
        filesize: parseInt(data.file.size ?? "0"),
        html: data.previewHTML,
      },
    };
  }

  public async publish(id: string, source: string) {
    let document = await this.documentsRepository.fetch({
      source,
      initialId: id,
    });
    switch (source) {
      case "information":
        const information = await this.informationsRepository.fetchInformation(
          id
        );
        if (!information) {
          throw new NotFoundError({
            message: `data not found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        document = this.mapInformationToDocument(information, document);
        break;
      case "contributions":
        const contribution = await this.contributionRepository.fetch(id);
        if (!contribution) {
          throw new NotFoundError({
            message: `data not found with id ${id}`,
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
              questionId
            );
          }
        );
        break;

      case "modeles_de_courriers":
        const model = await this.modelRepository.fetch(id);
        if (!model) {
          throw new NotFoundError({
            message: `data not found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        document = this.mapModelToDocument(model, document);
        break;

      default:
        throw new Error(`La source ${source} n'est pas implémentée`);
    }
    const result = await this.documentsRepository.update(document);
    return result;
  }
}
