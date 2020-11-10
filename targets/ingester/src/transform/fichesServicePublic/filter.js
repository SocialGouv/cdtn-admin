/**
 * Return a filtered set of FicheIndex
 * @param {import("@socialgouv/fiches-vdd").FicheIndex[]} fiches
 */
export function filter(fiches) {
  const filteredFiches = fiches.filter((fiche) => {
    const arianeIds = fiche.breadcrumbs.map((item) => item.id);
    if (!fiche.id.startsWith("F")) {
      return false;
    }
    /**  @param {string} id */
    const matchFilDAriane = (id) => arianeIds.includes(id);

    if (excludeFicheId.some(matchFilDAriane)) {
      return false;
    }
    if (excludeDossierId.some(matchFilDAriane)) {
      // Il existe des fiches que l'on souhaite garder, alors que
      // l'on ne souhaite pas garder son dossier parent
      return includeFicheId.some(matchFilDAriane);
    }

    const includeList = includeThemeId.concat(includeDossierId, includeFicheId);
    if (includeList.some(matchFilDAriane)) {
      return true;
    }

    // Par défaut, on exclue
    return false;
  });
  const particuliers = filteredFiches.filter(
    ({ type }) => type === "particuliers"
  );
  const professionnels = filteredFiches
    .filter(({ type }) => type === "professionnels")
    .filter(({ id }) =>
      particuliers.every(({ id: particulierId }) => particulierId !== id)
    );

  const associations = filteredFiches
    .filter(({ type }) => type === "associations")
    .filter(({ id }) =>
      particuliers.every(({ id: particulierId }) => particulierId !== id)
    )
    .filter(({ id }) =>
      professionnels.every(({ id: professionnelId }) => professionnelId !== id)
    );

  return particuliers.concat(professionnels, associations);
}

// Liste fournie par @jrduscher
const excludeDossierId = [
  "N500",
  "N511",
  "N505",
  "N31057",
  "N19978",
  "N186",
  "N431",
  "N512",
  "N503",
  "N102",
  "N20276",
  "N515",
  "N379",
];
const excludeFicheId = [
  "F1234",
  "F3059",
  "F10027",
  "F12416",
  "F13375",
  "F20314",
  "F20678",
  "F22290",
  "F22295",
  "F22316",
  "F22327",
  "F22335",
  "F22352",
  "F22354",
  "F22356",
  "F22358",
  "F22359",
  "F22424",
  "F22532",
  "F22553",
  "F22726",
  "F23369",
  "F23459",
  "F23460",
  "F23507",
  "F23670",
  "F23744",
  "F23756",
  "F23891",
  "F23992",
  "F23994",
  "F23997",
  "F24005",
  "F24013",
  "F31195",
  "F31204",
  "F31233",
  "F31263",
  "F31406",
  "F31409",
  "F31422",
  "F31427",
  "F31479",
  "F31670",
  "F31712",
  "F31713",
  "F31837",
  "F31926",
  "F32090",
  "F32095",
  "F32234",
  "F32258",
  "F32307",
  "F32308",
  "F32581",
  "F32703",
  "F32965",
  "F33843",
  "F34629",
  "F34631",
  "F34633",
  "F34900",
];
const includeDossierId = [
  "N20286",
  "N31477",
  "N107",
  "N31143",
  "N16594",
  "N24267",
  "N31775",
  "N22781",
  "N10779",
  "N31391",
  "N31392",
];
const includeThemeId = [
  "N19806", // particulier / travail
];
const includeFicheId = [
  "F92",
  "F153",
  "F174",
  "F1043",
  "F1190",
  "F1226",
  "F1234",
  "F1642",
  "F1691",
  "F1928",
  "F2064",
  "F2140",
  "F2141",
  "F2142",
  "F2309",
  "F2354",
  "F2517",
  "F2642",
  "F2742",
  "F10029",
  "F10041",
  "F12382",
  "F14809",
  "F14860",
  "F14868",
  "F15132",
  "F15813",
  "F19087",
  "F21000",
  "F22606",
  "F23106",
  "F23425",
  "F23633",
  "F31982",
  "F32329",
  "F32709",
  "F33050",
  "F34059",
  "F34705",
  "F34902",
];
