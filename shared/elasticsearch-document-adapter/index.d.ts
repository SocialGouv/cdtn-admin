export * from "./ingest";
export * from "./cdtnDocuments";

export function getDuplicateSlugs<T>(
  documents: unknown
): Promise<{ [key: string]: number }>;
export function cdtnDocumentsGen(): unknow;
