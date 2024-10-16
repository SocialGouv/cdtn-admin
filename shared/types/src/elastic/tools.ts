import { SOURCES } from "@socialgouv/cdtn-utils";

export type Tool = {
  date: string;
  icon: string;
  order: number;
  action: string;
  metaTitle: string;
  questions?: string[];
  description: string;
  displayTitle: string;
  breadcrumbs: Record<string, string | number>[];
  cdtnId: string;
  excludeFromSearch: boolean;
  id: string;
  isPublished: boolean;
  metaDescription: string;
  slug: string;
  source: typeof SOURCES.TOOLS | typeof SOURCES.EXTERNALS;
  text: string;
  title: string;
  _id: string;
  displayTool?: boolean;
};
