import { parseISO } from "date-fns";
import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { AgreementDoc, HasuraDocument } from "@socialgouv/cdtn-types";
import { Agreement } from "../agreements";

export const mapAgreementToDocument = (
  data: Agreement,
  document?: HasuraDocument<AgreementDoc>
): HasuraDocument<AgreementDoc> => {
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.name),
    initial_id: data.id,
    source: "conventions_collectives",
    meta_description: `IDCC ${data.id}: ${data.name}`,
    title: data.name,
    text: `IDCC ${data.id}: ${data.name} ${data.shortName}`,
    slug: document?.slug ?? `${data.id}-${slugify(data.shortName)}`,
    is_searchable: document
      ? document.is_searchable
      : data.kali_id !== undefined,
    is_available: true,
    is_published: data.kali_id !== undefined,
    document:
      data.kali_id !== undefined
        ? {
            date_publi: data.publicationDate
              ? `${data.publicationDate}T00:00:00.000Z`
              : undefined,
            effectif: data.workerNumber ?? undefined,
            num: Number(data.id),
            url: data.legifranceUrl ?? undefined,
            shortTitle: data.shortName,
            synonymes: data.synonyms,
          }
        : {
            date_publi: data.publicationDate
              ? parseISO(data.publicationDate).toISOString()
              : undefined,
            num: Number(data.id),
            shortTitle: data.shortName,
            synonymes: data.synonyms,
          },
  };
};
