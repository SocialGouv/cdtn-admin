import { HasuraDocument } from "./common";

export type Theme = HasuraDocument<ThemeDoc, "themes">;

export type ThemeDoc = {
  icon?: string;
  shortTitle?: string;
  description?: string;
};
