import { InformationsRepository } from "../informations";
import { DocumentsRepository } from "./documents.repository";
import { NotFoundError } from "../ApiErrors";
import { Information } from "src/components/informations";
import { Document } from "src/components/documents";

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

  private mapInformationToDocument(data: Information): Document {
    // TODO Map data in json and populate DocumentData info
    return {
      cdtnId: data.cdtnId ?? "",
      metaDescription: data.metaDescription ?? "",
      slug: "",
      text: data.title,
      title: data.title,
      document: {
        date: data.updatedAt,
        intro: data.intro,
        references: [
          {
            label: data.referenceLabel,
            links: data.references,
          },
        ],
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
                    contents: contents.map(({ document }) => {
                      return {
                        title: document.title,
                        cdtnId: document.cdtnId,
                        source: document.source,
                      };
                    }),
                  };
                }
              ),
              references: [
                {
                  label: referenceLabel,
                  links: references,
                },
              ],
            };
          }
        ),
      },
    };
  }

  public async publish(id: string, source: string) {
    let document: Document | undefined;
    switch (source) {
      case "information":
      default:
        const data = await this.informationsRepository.fetchInformation(id);
        if (!data) {
          throw new NotFoundError({
            message: `data not found with id ${id}`,
            name: "NOT_FOUND",
            cause: null,
          });
        }
        document = this.mapInformationToDocument(data);
        break;
    }
    await this.documentsRepository.update(document);
  }
}
