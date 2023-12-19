import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { AgreementPage } from "../../index";
import { loadAgreements } from "../../lib/data-loaders";
import { formatIdcc } from "../../lib/formatIdcc";
import getAgreementsWithHighlight from "./agreementsWithHighlight";

const metaIdccs = [
  "54",
  "650",
  "714",
  "822",
  "827",
  "828",
  "829",
  "836",
  "860",
  "863",
  "878",
  "887",
  "898",
  "899",
  "911",
  "914",
  "920",
  "923",
  "930",
  "934",
  "937",
  "943",
  "948",
  "965",
  "979",
  "984",
  "1007",
  "1059",
  "1159",
  "1164",
  "1274",
  "1315",
  "1353",
  "1365",
  "1369",
  "1387",
  "1472",
  "1525",
  "1560",
  "1564",
  "1572",
  "1576",
  "1577",
  "1578",
  "1592",
  "1604",
  "1626",
  "1627",
  "1628",
  "1634",
  "1635",
  "1732",
  "1813",
  "1867",
  "1885",
  "1902",
  "1912",
  "1960",
  "1966",
  "1967",
  "2003",
  "2126",
  "2221",
  "2266",
  "2294",
  "2489",
  "2542",
  "2579",
  "2615",
  "2630",
  "2700",
  "2755",
  "2980",
  "2992",
  "3053",
  "3209",
  "3231",
];

export default async function getAgreementDocuments() {
  const agreements = (await loadAgreements()).flatMap((agreement) => {
    if (agreement.num === 3248) {
      return [
        {
          ...agreement,
          active: true,
          synonymes: metaIdccs,
        },
      ];
    }
    return !metaIdccs.find((num) => parseInt(num) === agreement.num)
      ? [agreement]
      : [];
  });

  // Pour éviter qu'on perdre l'highlight lorsque l'ingester va ré-écrire les documents dans la db.
  const agreementsWithHighlight = await getAgreementsWithHighlight();

  const agreementPages: AgreementPage[] = [];

  for (const agreement of agreements) {
    const highlight = agreementsWithHighlight[agreement.num];
    // Les CCs qui n'ont pas de page Légifrance ont un ID qui est undefined
    if (agreement.id === undefined) {
      agreementPages.push({
        id: `IDCC-${agreement.num}`,
        num: agreement.num,
        shortTitle: agreement.shortTitle,
        title: agreement.title,
        slug: slugify(
          `${agreement.num}-${agreement.shortTitle}`.substring(0, 80)
        ),
        text: `IDCC ${agreement.num}: ${agreement.title} ${agreement.shortTitle}`,
        description: `Idcc ${formatIdcc(agreement.num)} : ${
          agreement.shortTitle
        }`,
        is_searchable: false,
        is_published: false,
        source: SOURCES.CCN,
        synonymes: agreement.synonymes,
        ...(highlight ? { highlight } : {}),
      });
    } else {
      agreementPages.push({
        date_publi: agreement.date_publi,
        effectif: agreement.effectif ?? 1,
        id: agreement.id,
        mtime: agreement.mtime,
        num: agreement.num,
        slug: slugify(
          `${agreement.num}-${agreement.shortTitle}`.substring(0, 80)
        ),
        text: `IDCC ${agreement.num}: ${agreement.title} ${agreement.shortTitle}`,
        url: agreement.url,
        title: agreement.title,
        shortTitle: agreement.shortTitle,
        description: `Idcc ${formatIdcc(agreement.num)} : ${
          agreement.shortTitle
        }`,
        is_searchable: true,
        source: SOURCES.CCN,
        synonymes: agreement.synonymes,
        ...(highlight ? { highlight } : {}),
      });
    }
  }
  return agreementPages.sort((a, b) => a.num - b.num);
}
