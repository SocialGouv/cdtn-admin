declare module "unist-util-parents" {
  export type Root<Node> = Node & {
    parent: null;
    children: NodeWithParent<Root<Node>, Node>[];
  };

  export type NodeWithParent<Parent, Node> = Node & {
    parent: NodeWithParent<Parent, Parent> | null;
  };

  export default function parent<Tree>(tree: Tree): Root<Tree>;
}
