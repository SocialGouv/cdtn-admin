import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { AgreementPage } from "../../index";
import { loadAgreements } from "../../lib/data-loaders";
import { formatIdcc } from "../../lib/formatIdcc";
import getAgreementsWithHighlight from "./agreementsWithHighlight";

export default async function getAgreementDocuments() {
  const agreements = await loadAgreements();

  // Pour éviter qu'on perdre l'highlight lorsque l'ingester va ré-écrire les documents dans la db.
  const agreementsWithHighlight = await getAgreementsWithHighlight();

  const agreementPages: AgreementPage[] = [];

  for (const agreement of agreements) {
    // Les CCs qui n'ont pas de page Légifrance ont un ID qui est undefined
    if (agreement.id === undefined) {
      agreementPages.push({
        id: `IDCC-${agreement.num}`,
        num: agreement.num,
        shortTitle: agreement.shortTitle,
        title: agreement.shortTitle,
        longTitle: agreement.title,
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
      });
    } else {
      const highlight = agreementsWithHighlight[agreement.num];
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
        title: agreement.shortTitle,
        shortTitle: agreement.shortTitle,
        longTitle: agreement.title,
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
