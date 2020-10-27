declare module "@socialgouv/fiches-travail-data" {
  export type FicheTravailEmploi = {
    date: string
    description: string
    intro: string
    sections: TravailEmploiSection[]
    title: string
    pubId: string
    url: string
  }

  export type TravailEmploiSection = {
    title: string
    anchor: string
    html: string
    text: string
    description: string
    references: {
      [key: string]: {
        name: string
        articles: TravailEmploiReference[]
      }
    }
  }

  export type TravailEmploiReference = {
    text: string
    fmt: string
    cid: string
    id: string
  }
}
