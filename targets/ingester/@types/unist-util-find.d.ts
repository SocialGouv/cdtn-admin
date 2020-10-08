declare module "unist-util-find" {
  import { Node, Parent } from "unist";

  export default function find(root: Parent, matcher: (node: Node) => Boolean): Parent
}
