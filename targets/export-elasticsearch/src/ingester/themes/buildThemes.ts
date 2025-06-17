import { Theme, ThemeContentRelation } from "../types/themes";
import { GetBreadcrumbsFn } from "../breadcrumbs";
import { ThemeElasticDocument } from "@socialgouv/cdtn-types/build/elastic/theme";
import { DocumentRef } from "@socialgouv/cdtn-types";

export function buildThemes(
  themes: Theme[],
  getBreadcrumbs: GetBreadcrumbsFn
): ThemeElasticDocument[] {
  return themes.map(
    ({
      cdtnId,
      id,
      slug,
      source,
      title,
      document: { icon, description },
      contentRelations,
      parentRelations,
    }) => {
      const breadcrumbs = getBreadcrumbs(cdtnId);
      return {
        breadcrumbs: breadcrumbs.slice(0, -1),
        cdtnId,
        text: title,
        excludeFromSearch: false,
        metaDescription: `Explorez les contenus autour du thème ${title}`,
        children: themes
          .filter(
            ({ parentRelations: relations }) =>
              relations[0].parentThemeId === cdtnId
          )
          .sort(
            (
              { parentRelations: [{ position: positionA }] },
              { parentRelations: [{ position: positionB }] }
            ) => positionA - positionB
          )
          .map(({ slug: _slug, title: _title }) => ({
            label: _title,
            slug: _slug,
          })),
        description,
        icon,
        id,
        isPublished: true,
        position: parentRelations[0].position,
        refs: getContentRelation(contentRelations, getBreadcrumbs),
        slug,
        source,
        title,
      };
    }
  );
}

const getContentRelation = (
  contentRelations: ThemeContentRelation[],
  getBreadcrumbs: GetBreadcrumbsFn
): DocumentRef[] => {
  const sortedRelations = [...contentRelations].sort(
    ({ position: positionA }, { position: positionB }) => positionA - positionB
  );

  return sortedRelations.map(
    ({ content: { cdtnId, description, url, slug, source, title } }) => ({
      cdtnId,
      description,
      url,
      slug,
      source,
      title,
      breadcrumbs: getBreadcrumbs(cdtnId),
    })
  );
};
