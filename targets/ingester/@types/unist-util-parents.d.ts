declare module "unist-util-parents" {
  export type RootNodeWithParentChild<Root, Child> = Root & {
    parent: null;
    children: NodeWithParent<Child>;
  };

  export type RootNodeWithParent<T> = T & {
    parent: null;
    children: NodeWithParent<T>;
  };

  export type NodeWithParentChild<Parent, Child> = Child & {
    parent: NodeWithParent<Parent>;
    children: NodeWithParent<Child>[];
  };

  export type NodeWithParent<T> = T & {
    parent: NodeWithParent<T>;
    children: NodeWithParent<T>[];
  };

  export default function parent<R, C>(node: R): RootNodeWithParentChild<R, C>;
}
