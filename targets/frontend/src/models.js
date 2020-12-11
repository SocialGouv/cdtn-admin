export const statusLabels = {
  doing: "En cours de traitement",
  done: "Traités",
  rejected: "Rejetés",
  todo: "À traiter",
};

export function getStatusLabel(status) {
  return statusLabels[status] || status;
}

export function slugifyRepository(name) {
  return name.replace(/\//, "_");
}
export function unslugifyRepository(name) {
  return name.replace(/_/, "/");
}
