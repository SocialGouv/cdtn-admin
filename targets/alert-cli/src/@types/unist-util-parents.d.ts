declare module "unist-util-parents" {
  export type Root<Node> = Node & {
    parent: null;
  };

  export type NodeWithParent<Parent, Node> = Node & {
    parent: NodeWithParent<Parent, Node>;
  };

  export default function parent<Tree>(node: Tree): Root<Tree>;
}
