import { FicheTravailEmploi as FicheTravailEmploiRaw, Section as SectionRaw } from "@socialgouv/fiches-travail-data-types";
import { Question as QuestionRaw, GenericAnswer as GenericAnswerRaw, Answer as AnswerRaw } from "@socialgouv/contributions-data-types";

export as namespace admin

export type DocumentBase = {
  id: string
  initial_id: string
  title: string
  slug: string
  source: cdtnSources.SourceRoute
  text: string
  meta_description: string
  is_available: Boolean
  is_searchable: Boolean
  is_published: Boolean
}

export type FicheTravailEmploiDocument = DocumentBase & {
  document: FicheTravailEmploi
}

export type ContributionDocument = DocumentBase & {
  document: Contribution
}


export type HasuraDocument = FicheTravailEmploiDocument | ContributionDocument

export type FicheTravailEmploi = Omit<FicheTravailEmploiRaw, "title" | "sections"> & {
  sections: Section[]
}

type Section = Omit<SectionRaw, "references"> & {
  references: ParseDilaReference[]
}

export type ParseDilaReference = {
  url: string
  category: string
  title: string
  dila_id: string
  dila_cid: string
  dila_container_id: string
}

export type Contribution = Omit<QuestionRaw, "title" | "answers"> & {
  answers: {
    generic: GenericAnswer
    conventions: Answer[]
  }
}

type GenericAnswer = Omit<GenericAnswerRaw, "references"> & {
  references: ParseDilaReference[]
}

type Answer = Omit<AnswerRaw, "references"> & {
  references: ParseDilaReference[]
}
