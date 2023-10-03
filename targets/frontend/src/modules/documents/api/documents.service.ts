import { DocumentsRepository } from "./documents.repository";
import { Information, InformationsRepository } from "src/modules/informations";
import { DocumentRaw } from "../type";
import { format } from "date-fns";
import { generateIds } from "@shared/id-generator";
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

  private mapInformationToDocument(data: Information): DocumentRaw {
    return {
      ...generateIds(data.title),
      source: "information",
      meta_description: data.metaDescription ?? "",
      title: data.title,
      text: data.title,
      slug: slugify(data.title),
      document: {
        date: format(new Date(data.updatedAt ?? ""), "dd/MM/yyyy"),
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
              blocks: blocks.map(
                ({
                  file,
                  img,
                  type,
                  content,
                  contentDisplayMode,
                  contents,
                }) => {
                  return {
                    size: file?.size,
                    type,
                    imgUrl: img?.url,
                    fileUrl: file?.url,
                    markdown: content,
                    blockDisplayMode: contentDisplayMode,
                    contents: contents?.length
                      ? contents.map(({ document }) => {
                          return {
                            title: document.title,
                            cdtnId: document.cdtnId,
                            source: document.source,
                          };
                        })
                      : undefined,
                  };
                }
              ),
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
    let document: DocumentRaw | undefined;
    switch (source) {
      case "information":
      default:
        const information = await this.informationsRepository.fetchInformation(
          id
        );

        document = this.mapInformationToDocument(information);
        break;
    }
    const result = await this.documentsRepository.update(document);
    return result;
  }
}
