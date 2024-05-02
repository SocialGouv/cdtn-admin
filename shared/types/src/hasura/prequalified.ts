import { HasuraDocument } from "./common";

export type PrequalifiedDoc = {
  variants: string[];
};

export type Prequalified = HasuraDocument<PrequalifiedDoc, "prequalified">;
