import { DocumentsRepository } from "./documents.repository";
import { NotFoundError } from "src/lib/api/ApiErrors";
import { Information, InformationsRepository } from "src/modules/informations";
import { Document } from "../type";
import { format } from "date-fns";
import { generateCdtnId, generateInitialId } from "@shared/id-generator";
import slugify from "@socialgouv/cdtn-slugify";

export class DocumentsService {
  private readonly informationsRepository: InformationsRepository;
  private readonly documentsRepository: DocumentsRepository;

  constructor(
    informationsRepository: InformationsRepository,
    documentsRepository: DocumentsRepository
  ) {
    this.informationsRepository = informationsRepository;
    this.documentsRepository = documentsRepository;
  }

  private mapInformationToDocument(
    data: Information,
    cdtn_id?: string
  ): Document {
    return {
      cdtn_id: cdtn_id ?? generateCdtnId(data.title),
      initial_id: data.id ?? generateInitialId(),
      source: "information",
      meta_description: data.metaDescription ?? data.description,
      title: data.title,
      text: data.title,
      slug: slugify(data.title),
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
                  markdown: block.content,
                  ...(block.type === "graphic"
                    ? {
                        size: block.file?.size,
                        imgUrl: block.img?.url,
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

  public async publish(id: string, source: string) {
    console.log("id", id);
    let document = await this.documentsRepository.fetch({
      source,
      initialId: id,
    });
    console.log("currentDoc", document);
    switch (source) {
      case "information":
      default:
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
        document = this.mapInformationToDocument(
          information,
          document?.cdtn_id
        );
        break;
    }
    const result = await this.documentsRepository.update(document);
    return result;
  }
}
