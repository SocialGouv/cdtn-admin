declare module "unist-util-parents" {

  import { NodeT } from "unist";

  export default function parent(node: NodeWithParent): NodeWithParent

  type NodeWithParent = Node & {
    parent?: NodeWithParent[]
  }
}
