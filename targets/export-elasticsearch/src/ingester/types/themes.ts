export interface Data {
  themes: Theme[];
}

export interface Theme {
  cdtnId: string;
  id: string;
  slug: string;
  source: string;
  title: string;
  document: ThemeDocument;
  contentRelations: ThemeContentRelation[];
  parentRelations: ThemeParentRelation[];
}

export interface ThemeDocument {
  icon?: string;
  shortTitle?: string;
  description?: string;
}

export interface ThemeContentRelation {
  content: ThemeContent;
  position: number;
}

export interface ThemeContent {
  cdtnId: string;
  slug: string;
  source: string;
  title: string;
  document: unknown;
}

export interface ThemeParentRelation {
  parentThemeId?: string;
  position: number;
}
