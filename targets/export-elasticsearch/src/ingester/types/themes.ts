import type { GraphQLResponseRoot } from "./GraphQL";

export type ThemeQueryResult = GraphQLResponseRoot<Data>;

export type Data = {
  themes: Theme[];
};

export type Theme = {
  cdtnId: string;
  id: string;
  slug: string;
  source: string;
  title: string;
  document: ThemeDocument;
  contentRelations: ThemeContentRelation[];
  parentRelations: ThemeParentRelation[];
};

export type ThemeDocument = {
  icon?: string;
  shortTitle?: string;
  description?: string;
};

export type ThemeContentRelation = {
  content: ThemeContent;
  position: number;
};

export type ThemeContent = {
  cdtnId: string;
  slug: string;
  source: string;
  title: string;
  document: unknown;
};

export type ThemeParentRelation = {
  parentThemeId?: string;
  position: number;
};
