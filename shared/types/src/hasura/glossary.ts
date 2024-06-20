export type Glossary = Term[];

export interface Term {
  term: string;
  abbreviations: string[];
  definition: string;
  variants: string[];
  slug?: string;
  references?: string[];
}

export type GlossaryTerms = {
  definition: string | null;
  pattern: RegExp;
};
