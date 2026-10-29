import { fetchLinkedContent } from "../common";
import {
  DocumentElasticWithSource,
  NewsElasticLink,
  NewsTemplateDoc,
  NewsTemplateLink,
} from "@socialgouv/cdtn-types";

// « Contenus liés » d'une actualité. Une actualité publiée avant la fusion des
// deux blocs de l'admin n'a que des `cdtnReferences` : ils sont ajoutés à la
// suite des liens, sans doublon, pour ne pas devoir la republier.
const toTemplateLinks = ({
  links = [],
  cdtnReferences = [],
}: NewsTemplateDoc): NewsTemplateLink[] => {
  const linkedIds = new Set(
    links.flatMap((link) => (link.type === "cdtn" ? [link.cdtnId] : []))
  );
  return [
    ...links,
    ...cdtnReferences
      .filter(({ cdtnId }) => !linkedIds.has(cdtnId))
      .map(({ cdtnId }): NewsTemplateLink => ({ type: "cdtn", cdtnId })),
  ];
};

export const generateLinks = async (
  news: DocumentElasticWithSource<NewsTemplateDoc>
): Promise<NewsElasticLink[]> => {
  const linkPromises = toTemplateLinks(news).map(
    async (link): Promise<NewsElasticLink | undefined> => {
      if (link.type === "external") return link;
      const linkedDocument = await fetchLinkedContent(
        link.cdtnId,
        `Actualité ${news.title}`
      );
      if (!linkedDocument) return;

      return {
        type: "cdtn",
        source: linkedDocument.source,
        slug: linkedDocument.slug,
        title: linkedDocument.title,
        ...(link.intro ? { intro: link.intro } : {}),
      };
    }
  );
  const generatedLinks = await Promise.all(linkPromises);
  return generatedLinks.filter((link): link is NewsElasticLink => !!link);
};
