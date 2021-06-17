import type { Parent } from "unist";

declare module "unist-util-select" {
  export function selectAll<Child>(selector: string, tree: Parent): Child[];
}
