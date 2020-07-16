declare module "@socialgouv/fiches-travail-data" {

  export type FicheTravailEmploi = {
    date: string
    description: string
    intro: string
    pubId: string
    sections: Section[]
    title: string
    url: string
  }
  export type Section = {
    anchor: string
    description: string
    html: string
    references: ReferencesMap
    text: string
    titre: string
  }

  export type ReferencesMap = {
    [key: string]: {
      name: string
      articles: ReferenceFTE[]
    }
  }

  export type ReferenceFTE = {
    id: string
    cid: string
    fmt: string
    text: string
  }
}
