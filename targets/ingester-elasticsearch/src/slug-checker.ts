import {
  cdtnDocumentsGen,
  getDuplicateSlugs,
} from "@shared/elasticsearch-document-adapter";

class DuplicateSlugError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
  duplicateSlugs: { [key: string]: number };
}

void (async function main() {
  try {
    const documents = await cdtnDocumentsGen();
    const duplicateSlugs = getDuplicateSlugs(documents);

    if (duplicateSlugs.length > 0) {
      const error = new DuplicateSlugError("duplicate slugs found");
      error.duplicateSlugs = duplicateSlugs;
      throw error;
    }
  } catch (error: unknown) {
    if (error instanceof DuplicateSlugError) {
      console.error(error);
      console.error("Document with same slugs detected !");
      console.error("slug | count");
      console.error("-----|----");
      Object.entries(error.duplicateSlugs).forEach(([slug, count]) =>
        console.error(`${slug} | ${count}`)
      );
    } else {
      console.error(error);
    }

    process.exit(1);
  }
})();
