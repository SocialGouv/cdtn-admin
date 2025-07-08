import { Information } from "src/modules/informations";
import { format, parseISO } from "date-fns";
import { generateCdtnId, generateInitialId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { getGlossaryContent } from "src/modules/common/getGlossaryContent";

export const mapInformationToDocument = async (
  data: Information,
  document?: HasuraDocument<any>
): Promise<HasuraDocument<any>> => {
  const introWithGlossary = await getGlossaryContent(data.intro ?? "");
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.title),
    initial_id: data.id ?? generateInitialId(),
    source: "information",
    meta_description: data.metaDescription ?? data.description,
    title: data.title,
    text: data.title,
    slug: document?.slug ?? slugify(data.title),
    is_searchable: document ? document.is_searchable : true,
    is_published: document ? document.is_published : true,
    is_available: true,
    document: {
      date: format(parseISO(data.displayDate), "dd/MM/yyyy"),
      intro: data.intro,
      introWithGlossary,
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
      contents: await Promise.all(
        data.contents.map(
          async ({ name, title, blocks, references, referenceLabel }) => {
            return {
              name,
              title,
              blocks: await Promise.all(
                blocks.map(async (block) => {
                  const htmlWithGlossary = await getGlossaryContent(
                    block.content ?? ""
                  );
                  return {
                    type: block.type,
                    ...(block.type === "content"
                      ? {
                          title: block.content,
                        }
                      : {
                          markdown: block.content,
                          htmlWithGlossary,
                        }),
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
                            ? block.contents.map(
                                ({ document: contentDocument }) => {
                                  return {
                                    title: contentDocument.title,
                                    cdtnId: contentDocument.cdtnId,
                                    source: contentDocument.source,
                                  };
                                }
                              )
                            : undefined,
                        }
                      : {}),
                  };
                })
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
        )
      ),
    },
  };
};
