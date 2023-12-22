import type { Theme } from "./types/themes";
import { Breadcrumbs } from "@shared/types";
export type GetBreadcrumbsFn = (cdtnId: string) => Breadcrumbs[];
export declare function buildGetBreadcrumbs(themes: Theme[]): GetBreadcrumbsFn;
