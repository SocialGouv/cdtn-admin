import { NodeWithChildren } from "unist";
import {Commit} from "nodegit"

export as namespace alerts

export function fileFilterFn(path: string): Boolean

export function nodeComparatorFn(node1: NodeWithChildren, node2: NodeWithChildren): Boolean

export function compareTreeFn(tree: NodeWithChildren, tree2: NodeWithChildren): Changes

export function insertAlert(repository: string, changes: AlertChangesWithRef): Promise<alerts.Alert>

export function updateSource(repository: string, tag: string): Promise<alerts.Source>

export type Source = {
  repository: string
  tag: string
}

export type Changes = {
  modified: Object[]
  removed: Object[]
  added: Object[]
}

export type AlertChanges = {
  file: string
  id: string
  num: Number
  title: string
} & Changes

export type AlertChangesWithRef = {
  ref: string
} & AlertChanges

export type AlertInfo = {
  num: Number,
  title: string,
  id: string, // Kalicont
  file: string, //
}

export type Alert = {
  info: AlertInfo
  changes: Changes
  repository: string
  source: string
  status: string
  ref: string
}

export type RepoAlert = {
  repository: string
  newRef: string
  changes: AlertChangesWithRef[]
}

export type GitTagData = {
  ref: string
  commit: Commit
}
