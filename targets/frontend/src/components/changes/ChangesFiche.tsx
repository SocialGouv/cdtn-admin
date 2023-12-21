import { Chip } from "@mui/material";
import { DocumentInfoWithCdtnRef } from "@shared/types";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { theme } from "src/theme";

type Props = {
  documents: DocumentInfoWithCdtnRef[];
  type: "vdd" | "travail-data";
};

const palettes = {
  contributions: "#5bc0eb",
  prequalified: "#fde74c",
  themes: "#9bc53d",
} as any;

export function ChangesFiche({ documents, type }: Props): JSX.Element {
  return (
    <div>
      {documents.map((doc) => (
        <div
          key={doc.id}
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Chip
            label={doc.source}
            style={{ backgroundColor: palettes[doc.source], width: "125px" }}
          />
          <div style={{ marginLeft: "20px" }}>
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
                  type === "vdd"
                    ? doc.url ??
                      `https://code.travail.gouv.fr/fiche-service-public/${slugify(
                        doc.ref.title
                      )}`
                    : `https://code.travail.gouv.fr/fiche-ministere-travail/${slugify(
                        doc.ref.title
                      )}`
                }
              >
                {doc.ref.id} - {doc.ref.title}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
