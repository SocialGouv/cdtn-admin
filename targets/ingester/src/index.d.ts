import type { SourceValues } from "@socialgouv/cdtn-sources"
import type { Answer, Question, DilaRef } from "@socialgouv/contributions-data"
import type { IndexedAgreement } from "@socialgouv/kali-data"

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

type Contribution = Document & Question

type LegiArticle = ExternalDocument & {
  dateDebut: number
  html: string
}

type FicheServicePublic = ExternalDocument & {
  date: string //"O1/01/2021"
  raw: string
  excludeFromSearch: Boolean
  references_juridiques: Reference[]
}

type FicheTravailEmploi = ExternalDocument & {
  date: string // "30/09/2020",
  intro: string,
  sections: TravailEmploiSection[]
}

type TravailEmploiSection = {
  title: string
  anchor: string
  html: string
  text: string
  description: string
  references: Reference[]
}

type AgreementPage = Document & {
  num: Number
  date_publi?: string
  effectif?: Number
  mtime?: Number
  shortTitle: string
  answers: AgreementAnswer[]
  url?: string,
  articlesByTheme: AgreementArticleByBlock[]
}

type AgreementAnswer = {
  index: Number
  references: DilaRef[]
  slug: string
  question: string
  answer: string
}

type AgreementArticleByBlock = {
  bloc: string;
  articles: {
    cid: string
    id: string
    section: string
    title: string
  }[];
};

type Reference = {
  id: string
  title: string
  url: string
  type: cdtnSources.RouteValues
}


/** Document type */
type CdtnDocument = Contribution | LegiArticle | AgreementPage | FicheServicePublic | FicheTravailEmploi



// type EditorialDocument = Document & {
//   date: string
//   contents: EditorialContent[]
// }

// type EditorialContent = {
//   type: "markdown" | "graphic"
//   name: string
//   title: string
//   references: Reference[]
// }

// type Tool = Document & {
//   action: string
//   date: string //"O1/01/2021"
//   icon: string
// }

// type ExternalTool = ExternalDocument & {
//   action: string
//   icon: string
// }

// type DocTemplate = Document & {
//   author: string
//   date: string // "10/12/2019"
//   filename: string
//   filesize: number,
//   fileurl: string
//   html: string
// }

// type ThematicFile = {
//   categories: ThematicFileCategory[]
// }

// type ThematicFileCategory = {
//   icon: string
//   id: string
//   position: number
//   ref: ThematicFileLink[]
// }

// type ThematicFileLink = {
//   url: string
//   title: string
// }
