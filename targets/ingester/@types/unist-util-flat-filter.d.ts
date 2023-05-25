declare module "unist-util-flat-filter" {
  export type RootNodeWithParentChild<Root, Child> = Root & {
    parent: null;
    children: NodeWithParent<Child>;
  };

  export type NodeWithParent<T> = T & {
    parent: NodeWithParent<T>;
    children: NodeWithParent<T>[];
  };

  export default function flatFilter<T extends Node>(
    tree: Node,
    filter?: Test<T>
  ): RootNodeWithParentChild<T> | null;
}
