declare module "@socialgouv/fiches-vdd" {
  export type RawJson = {
    name: string
    text: string
    type: string
    attributes: { ID: string, URL: string }
    children: RawJson[]
  }

  export type FicheIndex = {
    id: string
    type: "particuliers" | "associations" | "professionnels"
    title: string
    subject: string
    theme: string
    breadcrumbs: FicheVddBreadcrumbs[]
    date: string
  }

  export type FicheVddBreadcrumbs = {
    id: string
    text: string
  }

  export function getFiche(type: string, id: string): RawJson
}
