export const alertStatusLabels = {
  doing: "En cours",
  done: "Traités",
  rejected: "Sans objet",
  todo: "À traiter",
};

export type AlertStatusType = "doing" | "done" | "rejected" | "todo";

export const alertStatusWordings = {
  doing:
    "Les alertes qui sont en cours d'analyse et de traitement par l'équipe.",
  done:
    "Les alertes qui entraine la modification des documents gérés par l'équipe (outils, contributions, ...)",
  rejected:
    "Les alertes qui n'entraine pas la modification de documents gérés par l'équipe.",
  todo: "Les nouvelles alertes remontées dernièrement",
};

export function getStatusLabel(status: AlertStatusType): string {
  return alertStatusLabels[status] || status;
}

export function slugifyRepository(name: string): string {
  return name.replace(/\//, "_");
}
export function unslugifyRepository(name: string): string {
  return name.replace(/_/, "/");
}
