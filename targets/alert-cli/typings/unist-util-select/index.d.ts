import { NodeT } from "unist"

declare module "unist-util-select" {
  export function selectAll<T>(selector:string, tree: NodeT<T>): NodeT<T>[]
}
