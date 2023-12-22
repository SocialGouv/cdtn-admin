import type { Glossary } from "../types";
/**
 * addGlossary is a heavy operation that is only neede while dumping for ES
 */
export type AddGlossaryReturnFn = (content: string) => string;
export declare const createGlossaryTransform: (glossary: Glossary) => AddGlossaryReturnFn;
