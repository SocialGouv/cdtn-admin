import { Chip } from "@mui/material";
import { DocumentInfoWithCdtnRef } from "@socialgouv/cdtn-types";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-utils";
import { theme } from "src/theme";
import { styled } from "@mui/system";

type Props = {
  documents: DocumentInfoWithCdtnRef[];
  type: "vdd" | "travail-data";
};

export function ChangesFiche({ documents, type }: Props): JSX.Element {
  return (
    <div>
      {documents.map((doc) => (
        <DocumentContainer key={doc.id}>
          <DocumentChip label={doc.source} source={doc.source} />
          <LinkContainer>
            <DocumentLink
              target="_blank"
              href={`https://code.travail.gouv.fr/${getRouteBySource(
                doc.source
              )}/${
                doc.slug && doc.slug !== "" ? doc.slug : slugify(doc.title)
              }`}
            >
              {doc.title}
            </DocumentLink>

            <ReferenceLink
              target="_blank"
              href={
                type === "vdd"
                  ? (doc.url ??
                    `https://code.travail.gouv.fr/fiche-service-public/${slugify(
                      doc.ref.title
                    )}`)
                  : `https://code.travail.gouv.fr/fiche-ministere-travail/${slugify(
                      doc.ref.title
                    )}`
              }
            >
              {doc.ref.id} - {doc.ref.title}
            </ReferenceLink>
          </LinkContainer>
        </DocumentContainer>
      ))}
    </div>
  );
}

const palettes = {
  contributions: "#5bc0eb",
  prequalified: "#fde74c",
  themes: "#9bc53d",
} as const;

const DocumentContainer = styled("div")({
  marginBottom: "1rem",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});

const DocumentChip: any = styled(Chip)(({ source }: any) => ({
  backgroundColor: palettes[source as keyof typeof palettes],
  width: "125px",
}));

const LinkContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  marginLeft: "20px",
});

const DocumentLink = styled("a")({
  marginBottom: "10px",
  width: "fit-content",
});

const ReferenceLink = styled("a")({
  color: theme.colors.muted,
  fontSize: "0.8rem",
  width: "fit-content",
});
