import { inject, injectable } from "inversify";
import { getName, name, sendMattermostMessage } from "../utils";
import { addGlossaryContentWorker } from "../workers/glossary";
import { ValidatorCreateGlossaryType } from "../controllers/middlewares";
import { GlossaryRepository } from "../repositories/glossary";
import { logger } from "@shared/utils";
import { Glossary } from "@socialgouv/cdtn-types";
import { SOURCES } from "@socialgouv/cdtn-sources";

@injectable()
@name("GlossaryService")
export class GlossaryService {
  constructor(
    @inject(getName(GlossaryRepository))
    private readonly glossaryRepository: GlossaryRepository
  ) {}

  async getContentWithGlossary(
    type: ValidatorCreateGlossaryType["type"],
    content: ValidatorCreateGlossaryType["content"]
  ): Promise<string> {
    const glossary = await this.glossaryRepository.getGlossary();
    const result = await addGlossaryContentWorker({
      glossary,
      type,
      content,
    });
    return result;
  }

  async runGlossaryForAllContent() {
    const glossary = await this.glossaryRepository.getGlossary();
    await sendMattermostMessage(
      `**Glossaire:** Lancement du processus ⏳`,
      process.env.MATTERMOST_CHANNEL_EXPORT
    );
    logger.info("=== Starting glossary update ===");
    logger.info("Updating contributions documents glossary...");
    await this.updateGlossaryForEditorialContents(glossary);
    logger.info("Updating editorial content documents glossary...");
    await this.updateGlossaryForContributions(glossary);
    logger.info("=== Ending glossary update ===");
    await sendMattermostMessage(
      `**Glossaire:** Fin du processus ⌛️`,
      process.env.MATTERMOST_CHANNEL_EXPORT
    );
  }

  private async updateGlossaryForContributions(glossary: Glossary) {
    const contributions = await this.glossaryRepository.fetchDocumentBySource(
      SOURCES.CONTRIBUTIONS
    );
    logger.info(`Found ${contributions.length} contributions`);
    for (let i = 0; i < contributions.length; i++) {
      const document = contributions[i].document;
      if (document.contentType === "ANSWER") {
        const contentWithGlossary = await addGlossaryContentWorker({
          glossary,
          type: "html",
          content: document.content,
        });
        await this.glossaryRepository.updateDocument(contributions[i].cdtn_id, {
          ...document,
          contentWithGlossary,
        });
        logger.info(
          `Updated contribution ${i + 1}/${contributions.length} with glossary`
        );
      }
    }
  }

  private async updateGlossaryForEditorialContents(glossary: Glossary) {
    const editorialContents =
      await this.glossaryRepository.fetchDocumentBySource(
        SOURCES.EDITORIAL_CONTENT
      );
    logger.info(`Found ${editorialContents.length} editorial contents`);
    for (let i = 0; i < editorialContents.length; i++) {
      const document = editorialContents[i].document;
      const introWithGlossary = await addGlossaryContentWorker({
        glossary,
        type: "markdown",
        content: document.intro,
      });
      await this.glossaryRepository.updateDocument(
        editorialContents[i].cdtn_id,
        {
          ...document,
          introWithGlossary,
          contents: await Promise.all(
            document.contents.map(async (content: any) => {
              return {
                ...content,
                blocks: await Promise.all(
                  content.blocks.map(async (block: any) => {
                    if ("markdown" in block) {
                      const htmlWithGlossary = await addGlossaryContentWorker({
                        glossary,
                        type: "markdown",
                        content: block.markdown,
                      });
                      return {
                        ...block,
                        htmlWithGlossary,
                      };
                    }
                    return block;
                  })
                ),
              };
            })
          ),
        }
      );
      logger.info(
        `Updated editorial content ${i + 1}/${
          editorialContents.length
        } with glossary`
      );
    }
  }
}
