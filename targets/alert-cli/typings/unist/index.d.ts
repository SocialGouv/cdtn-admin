import type { Node } from "unist"

declare module "unist" {

  type NodeWithChildren = Node & {
    data: Object
    children?: NodeWithChildren[]
  }

  export type NodeT<T> = NodeWithChildren & T
}
