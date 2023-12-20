import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";

import type { Theme } from "./types/themes";
import { Breadcrumbs } from "@shared/types";

export type GetBreadcrumbsFn = (cdtnId: string) => Breadcrumbs[];

function toBreadcrumbs(theme: Theme): Breadcrumbs {
  return {
    label: theme.title,
    position: theme.parentRelations[0].position,
    slug: `/${getRouteBySource(SOURCES.THEMES)}/${theme.slug}`,
  };
}

function minPositionBreadcrumb(breadcrumb: Breadcrumbs[]) {
  return (
    breadcrumb.reduce<number | undefined>(
      (result, { position }) =>
        result && result < position ? result : position,
      undefined
    ) ?? 0
  );
}

export function getMainBreadcrumb(
  allBreadcrumbs: (Breadcrumbs[] | undefined)[] = []
) {
  return allBreadcrumbs.reduce<Breadcrumbs[]>((topBreadcrumb, breadcrumb) => {
    if (
      topBreadcrumb &&
      breadcrumb &&
      minPositionBreadcrumb(topBreadcrumb) > minPositionBreadcrumb(breadcrumb)
    ) {
      return breadcrumb;
    }
    return topBreadcrumb;
  }, allBreadcrumbs[0] ?? []);
}

export function buildGetBreadcrumbs(themes: Theme[]): GetBreadcrumbsFn {
  // beware, this one is recursive
  // we might want to set a depth limit for safety reasons
  // it picks a relation and returns an array of all possible breadcrumbs
  function buildAllBreadcrumbs(theme: Theme): (Breadcrumbs[] | undefined)[] {
    const currentBreadcrumb = toBreadcrumbs(theme);
    const parentTheme = themes.filter(
      (parentTheme) =>
        parentTheme.cdtnId === theme.parentRelations[0].parentThemeId
    );
    if (!parentTheme.length) {
      return [[currentBreadcrumb]];
    }
    return parentTheme.flatMap(buildAllBreadcrumbs).map((breadcrumbs) => {
      breadcrumbs?.push(currentBreadcrumb);
      return breadcrumbs;
    });
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
