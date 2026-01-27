import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-utils";

import type { Theme } from "./types/themes";
import { Breadcrumb } from "@socialgouv/cdtn-types";

export type GetBreadcrumbsFn = (cdtnId: string) => Breadcrumb[];

function toBreadcrumbs(
  theme: Theme,
  parentTheme: Theme | undefined
): Breadcrumb {
  if (parentTheme) {
    return {
      label: theme.title,
      position: theme.parentRelations[0].position,
      slug: `/${getRouteBySource(SOURCES.THEMES)}/${parentTheme.slug}#${theme.slug}`,
    };
  }
  return {
    label: theme.title,
    position: theme.parentRelations[0].position,
    slug: `/${getRouteBySource(SOURCES.THEMES)}/${theme.slug}`,
  };
}

function minPositionBreadcrumb(breadcrumb: Breadcrumb[]) {
  return (
    breadcrumb.reduce<number | undefined>(
      (result, { position }) =>
        result !== undefined && result < position ? result : position,
      undefined
    ) ?? 0
  );
}

export function getMainBreadcrumb(
  allBreadcrumbs: (Breadcrumb[] | undefined)[] = []
) {
  return allBreadcrumbs.reduce<Breadcrumb[]>(
    (topBreadcrumb, breadcrumb, index) => {
      if (index === 0) {
        return topBreadcrumb;
      }
      if (
        breadcrumb &&
        topBreadcrumb.length > breadcrumb.length &&
        minPositionBreadcrumb(topBreadcrumb) > minPositionBreadcrumb(breadcrumb)
      ) {
        return breadcrumb;
      }
      return topBreadcrumb;
    },
    allBreadcrumbs[0] ?? []
  );
}

export function buildGetBreadcrumbs(themes: Theme[]): GetBreadcrumbsFn {
  // beware, this one is recursive
  // we might want to set a depth limit for safety reasons
  // it picks a relation and returns an array of all possible breadcrumbs
  function buildAllBreadcrumbs(theme: Theme): (Breadcrumb[] | undefined)[] {
    const parentTheme = themes.find(
      (parentTheme) =>
        parentTheme.cdtnId === theme.parentRelations[0].parentThemeId
    );
    const currentBreadcrumb = toBreadcrumbs(theme, parentTheme);
    if (!parentTheme) {
      return [[currentBreadcrumb]];
    }
    const parentBreadcrumbs = toBreadcrumbs(parentTheme, undefined);
    return [[parentBreadcrumbs, currentBreadcrumb]];
  }

  const themeToBreadcrumbsMap = new Map(
    themes.map((theme) => [theme.cdtnId, buildAllBreadcrumbs(theme)])
  );

  return function getBreadcrumbs(cdtnId: string) {
    if (!cdtnId) return [];
    const relatedThemes = themes.filter(
      (theme) =>
        theme.cdtnId === cdtnId ||
        theme.contentRelations.find(
          (contentRelation) => contentRelation.content.cdtnId === cdtnId
        )
    );
    const allBreadcrumbs = relatedThemes.flatMap((theme) =>
      themeToBreadcrumbsMap.get(theme.cdtnId)
    );
    return getMainBreadcrumb(allBreadcrumbs);
  };
}
