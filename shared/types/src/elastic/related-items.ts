import { routeBySource } from "@socialgouv/cdtn-utils";

export interface LinkedContent {
  source: keyof typeof routeBySource;
  slug: string;
  title: string;
}
