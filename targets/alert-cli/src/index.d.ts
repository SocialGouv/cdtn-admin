import { Node } from "unist";
import { Commit } from "nodegit"
import { NodeWithParent } from "unist-util-parents";
import { SOURCES } from "@socialgouv/cdtn-sources";

export function fileFilterFn(path: string): Boolean

export function nodeComparatorFn(node1: DilaNode, node2: DilaNode): Boolean

export function compareTreeFn<T>(tree: T, tree2: T): Changes

export function insertAlert(repository: string, changes: AlertChanges): Promise<alerts.Alert>

export function updateSource(repository: string, tag: string): Promise<alerts.Source>

export as namespace alerts

type Source = {
  repository: string
  tag: string
}

type AstChanges = {
  modified: NodeWithParent[]
  removed: NodeWithParent[]
  added: NodeWithParent[]
}

type Changes = AstChanges & {
  documents: { document: Document, reference: Reference }[]
}

type AlertChanges = {
  ref: string
  file: string
  id: string
  num: Number
  title: string
} & Changes

type AlertInfo = {
  num: Number,
  title: string,
  id: string, // Kalicont
  file: string, //
}

type Alert = {
  info: AlertInfo
  changes: Changes
  repository: string
  source: string
  status: string
  ref: string
}

type RepoAlert = {
  repository: string
  newRef: string
  changes: AlertChanges[]
}

type GitTagData = {
  ref: string
  commit: Commit
}

type Reference = {
  category: string
  title: string
  dila_id: string
  dila_cid: string
  dila_container_id: string
}

type DocumentReferences = {
  document: Document
  references: Reference[]
}
type Document = {
  id: string
  idcc?: string
  title: string
  type: "contributions" | "fiches_ministere_travail"
}


type DocumentWithRef = Document & {
  reference: Reference
}

type DilaNode = {
  type: "article" | "section" | "code" | "convention collective"
  parent: DilaNode | null
  data: {
    id: string
    cid: string
    title: string
    etat: string
    num: title
    content?: string
    nota?: string
    texte?: string
  }
  children?: DilaNode[]
}

type DilaNodeWithContext = DilaNode & {
  context: {
    parents: string[],
    textId: string | null,
    containerId: string | null,
  }
}
