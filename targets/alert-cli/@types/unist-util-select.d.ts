declare module "unist-util-select" {
  export function selectAll<Tree, Child>(selector: string, tree: Tree): Child[];
}
