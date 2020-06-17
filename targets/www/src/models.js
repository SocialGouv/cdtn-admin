export const statusLabels = {
  todo: "À traiter",
  doing: "En cours de traitement",
  done: "Traités",
  rejected: "Rejetés",
};

export function getStatusLabel(status) {
  return statusLabels[status] || status;
}
