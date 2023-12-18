export type Glossary = Term[];
export type Term = {
    term: string;
    abbreviations: string[];
    definition: string;
    variants: string[];
};
