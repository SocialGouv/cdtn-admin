import { VddAlertChanges } from "@shared/types";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { theme } from "src/theme";

type Props = {
  documents: VddAlertChanges["documents"];
};

export function ChangesFicheSp({ documents }: Props): JSX.Element {
  return (
    <div>
      {documents.map((doc) => (
        <div key={doc.id} style={{ marginBottom: "1rem" }}>
          <a
            target="_blank"
            href={`https://code.travail.gouv.fr/${getRouteBySource(
              doc.source
            )}/${slugify(doc.title)}`}
          >
            {doc.title}
          </a>
          <div>
            <a
               target="_blank"
              style={{
                color: theme.colors.muted,
                fontSize: "0.8rem",
                lineHeight: 1,
              }}
              href={
                doc.url ??
                `https://code.travail.gouv.fr/fiche-service-public/${slugify(
                  doc.ref.title
                )}`
              }
            >
              {doc.ref.id} - {doc.ref.title}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
