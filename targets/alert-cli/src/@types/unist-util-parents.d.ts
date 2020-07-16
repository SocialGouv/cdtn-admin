export type NodeWithParent<T> = T & {
  parent: NodeWithParent<T> | null
}

function parent<T>(node: T): NodeWithParent<T>

export = parent
