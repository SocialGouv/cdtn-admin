export const ANSWER_TYPES = [
  { value: "ANSWER", label: "Afficher la réponse" },
  { value: "NOTHING", label: "La CC ne prévoit rien" },
  { value: "CDT", label: "La CC renvoie au Code du travail" },
  {
    value: "UNFAVOURABLE",
    label: "La CC est intégralement moins favorable que le CDT",
  },
  { value: "UNKNOWN", label: "Nous n'avons pas la réponse" },
] as const;

export type AgreementAnswerType = (typeof ANSWER_TYPES)[number]["value"];

export type AgreementRow = {
  id: string;
  name: string;
  unextended: boolean;
};

/** Type choisi par CC. Absent = pas encore renseigné. */
export type AgreementTypes = Record<string, AgreementAnswerType | undefined>;

/** Les CC non étendues sont verrouillées sur « ne prévoit rien » et comptent comme renseignées. */
export const getEffectiveType = (
  agreement: AgreementRow,
  types: AgreementTypes
): AgreementAnswerType | undefined =>
  agreement.unextended ? "NOTHING" : types[agreement.id];

export const initAgreementTypes = (
  agreements: AgreementRow[]
): AgreementTypes =>
  agreements.reduce<AgreementTypes>((acc, agreement) => {
    if (agreement.unextended) {
      acc[agreement.id] = "NOTHING";
    }
    return acc;
  }, {});

export const getRemainingAgreements = (
  agreements: AgreementRow[],
  types: AgreementTypes
): AgreementRow[] =>
  agreements.filter((agreement) => !getEffectiveType(agreement, types));

export const countByType = (
  agreements: AgreementRow[],
  types: AgreementTypes
): Record<AgreementAnswerType, number> => {
  const counts = ANSWER_TYPES.reduce(
    (acc, type) => ({ ...acc, [type.value]: 0 }),
    {} as Record<AgreementAnswerType, number>
  );
  agreements.forEach((agreement) => {
    const type = getEffectiveType(agreement, types);
    if (type) {
      counts[type] += 1;
    }
  });
  return counts;
};

const normalize = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Filtre par nom ou IDCC (insensible à la casse et aux accents). */
export const filterAgreements = (
  agreements: AgreementRow[],
  search: string
): AgreementRow[] => {
  const query = normalize(search.trim());
  if (!query) {
    return agreements;
  }
  return agreements.filter(
    (agreement) =>
      normalize(agreement.name).includes(query) ||
      agreement.id.replace(/^0+/, "").includes(query.replace(/^0+/, "")) ||
      agreement.id.includes(query)
  );
};

/** Applique un type aux CC sélectionnées, hors CC non étendues (verrouillées). */
export const applyTypeToSelection = (
  agreements: AgreementRow[],
  types: AgreementTypes,
  selectedIds: string[],
  type: AgreementAnswerType
): AgreementTypes => {
  const next = { ...types };
  agreements.forEach((agreement) => {
    if (selectedIds.includes(agreement.id) && !agreement.unextended) {
      next[agreement.id] = type;
    }
  });
  return next;
};
