import type { SourceValues } from "@socialgouv/cdtn-sources";
import type { GetBreadcrumbsFn } from "./breadcrumbs";
import type { Glossary } from "./types";
import type { DocumentElastic, DocumentElasticWithSource } from "./types/Glossary";
export declare function getGlossary(): Promise<Glossary>;
export declare function getDocumentBySource<T>(source: SourceValues, getBreadcrumbs?: GetBreadcrumbsFn | undefined): Promise<DocumentElasticWithSource<T>[]>;
export declare function getDocumentBySourceWithRelation(source: SourceValues, getBreadcrumbs: GetBreadcrumbsFn): Promise<DocumentElastic[]>;
