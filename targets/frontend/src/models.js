export const statusLabels = {
  doing: "En cours de traitement",
  done: "Traités",
  rejected: "Rejetés",
  todo: "À traiter",
};

export function getStatusLabel(status) {
  return statusLabels[status] || status;
}
