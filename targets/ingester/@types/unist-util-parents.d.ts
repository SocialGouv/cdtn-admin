declare module "unist-util-parents" {
  export type RootNodeWithParentChild<Root, Child> = Root & {
    parent: null;
    children: NodeWithParent<Child>;
  };

  export type NodeWithParentChild<Parent, Child> = Child & {
    parent: NodeWithParent<Parent>;
    children: NodeWithParent<Child>[];
  };

  export type NodeWithParent<T> = T & {
    parent: NodeWithParent<T>;
    children: NodeWithParent<T>[];
  };

  export default function parents<R, C>(node: R): RootNodeWithParentChild<R, C>;
}
