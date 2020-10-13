declare module "unist-util-parents" {
  export type RootNodeWithParent<T> = T & {
    parent: null
    children: NodeWithParent<T>
  }
  export type NodeWithParent<T> = T & {
    parent: NodeWithParent<T>
    children: NodeWithParent<T>[]
  }
  export default function parent<T>(node: T): RootNodeWithParent<T>
}
