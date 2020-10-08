import type { SourceValues } from "@socialgouv/cdtn-sources"
import type { Answer, Question } from "@socialgouv/contributions-data"

export as namespace ingester

type Document = {
  id: string
  description: string
  title: string
  source: SourceValues
  text: string
  slug: string
}

type ExternalDocument = Document & {
  url: string
}

type KaliContainer = ExternalDocument & {
  idcc: number
  shortTitle: string
}

type LegiArticle = ExternalDocument & {
  dateDebut: number
  html: string
}

type FicheServicePublic = ExternalDocument & {
  date: string //"O1/01/2021"
  raw: string
  references_juridiques: Reference[]
}

type EditorialDocument = Document & {
  date: string
  contents: EditorialContent[]
}

type Tool = Document & {
  action: string
  date: string //"O1/01/2021"
  icon: string
}

type ExternalTool = ExternalDocument & {
  action: string
  icon: string
}

type DocTemplate = Document & {
  author: string
  date: string // "10/12/2019"
  filename: string
  filesize: number,
  fileurl: string
  html: string
}

type EditorialContent = {
  type: "markdown" | "graphic"
  name: string
  title: string
  references: Reference[]
}

type Contribution = Document & Question

type ThematicFile = {
  categories: ThematicFileCategory[]
}

type ThematicFileCategory = {
  icon: string
  id: string
  position: number
  ref: InternalReference[]
}

type FicheTravailEmploi = ExternalDocument & {
  anchor: string
}


type Reference = UrlReference | CdtReference

type UrlReference = {
  title: string
  url: string
  type: "external"
}

type CdtReference = {
  id: string
  title: string
  type: "code-du-travail"
}

/** Internal reference reperesent a content from cdtn */
type InternalReference = {
  title: string
  url: string // cdtn content slug
}

type CdtnDocument = LegiArticle | KaliContainer | FicheServicePublic | FicheTravailEmploi | EditorialDocument
