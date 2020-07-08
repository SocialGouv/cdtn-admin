import { NodeWithChildren, Node } from "unist";
import {Commit} from "nodegit"
import {Reference} from "@socialgouv/contributions-data"
import { NodeWithParent } from "unist-util-parents";

export as namespace alerts

function fileFilterFn(path: string): Boolean

function nodeComparatorFn(node1: NodeWithChildren, node2: NodeWithChildren): Boolean

function compareTreeFn(tree: NodeWithChildren, tree2: NodeWithChildren): Changes

function insertAlert(repository: string, changes: AlertChangesWithRef): Promise<alerts.Alert>

function updateSource(repository: string, tag: string): Promise<alerts.Source>

type Source = {
  repository: string
  tag: string
}

type Changes = {
  modified: NodeWithParent[]
  removed: NodeWithParent[]
  added: NodeWithParent[]
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
  changes: AlertChangesWithRef[]
}

type GitTagData = {
  ref: string
  commit: Commit
}

type DocumentReference = {
  document: Document
  references: Reference[]
}
type Document = {
  id: string
  idcc?: string
  title: string
  type: "fiche-travail" | "contribution"
}

type DocumentWithRef = {
  id: string
  idcc?: string
  title: string
  type: "fiche-travail" | "contribution"
  reference: Reference
}
