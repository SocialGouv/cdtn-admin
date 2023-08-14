import { AccordionItem, AccordionPanel } from "@reach/accordion";
import type {
  AlertChanges,
  DilaAddedNode,
  DilaAlertChanges,
  DilaModifiedNode,
  DilaRemovedNode,
  DocumentInfoWithCdtnRef,
  DocumentReferences,
  FicheTravailEmploiInfo,
  FicheVddInfo,
} from "@shared/types";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { Badge, Box, Card } from "@mui/material";
import { Divider } from "@mui/material";

import Link from "next/link";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { AccordionButton, Button } from "src/components/button";

import { jsxJoin } from "../../lib/jsx";
import { Stack } from "../layout/Stack";
import { ViewDiff } from "./ViewDiff";

type Props = {
  label: string;
};

export const ChangesGroup: React.FC<Props> = ({ label, children }) => {
  return (
    <AccordionItem>
      <AccordionButton>{label}</AccordionButton>
      <AccordionPanel>
        <ul
          style={{ margin: 0, paddingLeft: "1.4rem", paddingRight: "1.4rem" }}
        >
          {children}
        </ul>
      </AccordionPanel>
    </AccordionItem>
  );
};

type ChangesProps = {
  changes: AlertChanges;
};
type DilaChangesProps = {
  changes: DilaAlertChanges;
};

export function AlertRelatedDocuments({
  changes,
}: DilaChangesProps): JSX.Element {
  return (
    <>
      {changes?.documents.map((change, i) => (
        <li key={`${changes.ref}-${change.document.id}-documents-${i}`}>
          <DilaRelatedDocuments docReferences={change} />
        </li>
      ))}
    </>
  );
}

type DilaRelatedDocumentsProps = {
  docReferences: DocumentReferences;
};

export function DilaRelatedDocuments({
  docReferences,
}: DilaRelatedDocumentsProps): JSX.Element {
  const [title, anchor] = docReferences.document.title.split("#");
  return (
    <>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://code.travail.gouv.fr/${getRouteBySource(
          docReferences.document.source
        )}/${slugify(title)}${anchor ? `#${anchor}` : ``}`}
      >
        {title} {anchor}
      </a>
      <Box>
        {jsxJoin(
          docReferences.references.map((node, i) => (
            <a
              style={{
                color: "muted",
                fontSize: "0.8rem",
                lineHeight: 1,
              }}
              href={node.url}
              key={`${docReferences.document.id}-${node.dila_id}-${node.title})-${i}`}
            >
              {node.title}
            </a>
          )),
          ", "
        )}
      </Box>
    </>
  );
}

type FicheRelatedDocumentsProps = {
  doc: DocumentInfoWithCdtnRef;
};

export function FicheRelatedDocuments({
  doc,
}: FicheRelatedDocumentsProps): JSX.Element {
  return (
    <>
      <Link href={`/contenus/${doc.id}`} passHref>
        <a>{doc.title}</a>
      </Link>{" "}
      <br />
      <span
        style={{
          color: "muted",
          fontSize: "0.8rem",
          lineHeight: 1,
        }}
      >
        {doc.ref.title}
      </span>
    </>
  );
}

export function AddedChanges({ changes }: ChangesProps): JSX.Element {
  switch (changes.type) {
    case "dila": {
      return (
        <>
          {changes.added.map((change) => (
            <li key={`${changes.ref}-${change.id}-added`}>
              <DilaLabelItem info={change} />{" "}
              <Badge sx={{ bg: getBadgeColor(change.etat), px: "0.7rem" }}>
                {change.etat}
              </Badge>
            </li>
          ))}
        </>
      );
    }
    case "travail-data": {
      return (
        <>
          {changes.added.map((change) => (
            <li key={`${changes.ref}-${change.pubId}-added`}>
              <FicheLink change={change} />
            </li>
          ))}
        </>
      );
    }
    case "vdd": {
      return (
        <>
          {changes.added.map((change) => (
            <li key={`${changes.ref}-${change.id}-added`}>
              <FicheLink change={change} />
            </li>
          ))}
        </>
      );
    }
  }
}

export function RemovedChanges({ changes }: ChangesProps): JSX.Element {
  switch (changes.type) {
    case "dila": {
      return (
        <>
          {changes.removed.map((change) => (
            <li key={`${changes.ref}-${change.id}-removed`}>
              <DilaLabelItem info={change} />
            </li>
          ))}
        </>
      );
    }
    case "travail-data": {
      return (
        <>
          {changes.removed.map((change) => (
            <li key={`${changes.ref}-${change.pubId}-removed`}>
              <FicheLink change={change} documents={changes.documents} />
            </li>
          ))}
        </>
      );
    }
    case "vdd": {
      return (
        <>
          {changes.removed.map((change) => (
            <li key={`${changes.ref}-${change.id}-removed`}>
              <FicheLink change={change} documents={changes.documents} />
            </li>
          ))}
        </>
      );
    }
  }
}

export function ModifiedChanges({ changes }: ChangesProps): JSX.Element {
  switch (changes.type) {
    case "dila": {
      return (
        <>
          {changes.modified.map((change) => {
            const statusUpdate = change.diffs.find(
              ({ type }) => type === "etat"
            );
            const textChanges = change.diffs.filter(
              ({ type }) => type !== "etat"
            );
            return (
              <li key={`${changes.ref}-${change.id}-modified`}>
                <DilaLabelItem info={change} />{" "}
                {statusUpdate && (
                  <>
                    <Badge
                      sx={{
                        bg: getBadgeColor(statusUpdate.previousText),
                        px: "0.8rem",
                      }}
                    >
                      {statusUpdate.previousText}
                    </Badge>
                    {" › "}
                  </>
                )}
                <Badge sx={{ bg: getBadgeColor(change.etat), px: "0.7rem" }}>
                  {change.etat}
                </Badge>
                {textChanges.length > 0 && (
                  <Box>
                    <ModificationViewer>
                      {jsxJoin(
                        textChanges.map((diff) => {
                          return (
                            <>
                              <strong>Modification du {diff.type}</strong>
                              <ViewDiff
                                previous={diff.previousText}
                                current={diff.currentText}
                              />
                            </>
                          );
                        }),
                        <Divider />
                      )}
                    </ModificationViewer>
                  </Box>
                )}
              </li>
            );
          })}
        </>
      );
    }
    case "travail-data": {
      return (
        <>
          {changes.modified.map((change) => (
            <li key={`${changes.ref}-${change.pubId}-modified`}>
              <FicheLink change={change} documents={changes.documents} />
              <ModificationViewer>
                {jsxJoin(
                  change.addedSections
                    .concat(change.removedSections, change.modifiedSections)
                    .map((diff) => {
                      return (
                        <>
                          <strong>{diff.title}</strong>
                          <ViewDiff
                            previous={diff.previousText}
                            current={diff.currentText}
                          />
                        </>
                      );
                    }),
                  <Divider />
                )}
              </ModificationViewer>
            </li>
          ))}
        </>
      );
    }
    case "vdd": {
      return (
        <>
          {changes.modified.map((change) => (
            <li key={`${changes.ref}-${change.id}-modified`}>
              <FicheLink change={change} documents={changes.documents} />
              <ModificationViewer>
                <strong>{change.title}</strong>
                <ViewDiff
                  previous={change.previousText}
                  current={change.currentText}
                />
              </ModificationViewer>
            </li>
          ))}
        </>
      );
    }
  }
}

function getBadgeColor(etat: string) {
  switch (etat) {
    case "VIGUEUR":
      return "positive";
    case "MOIFIE":
      return "caution";
    case "ABROGE":
    case "ABROGE_DIFF":
      return "critical";
    default:
      return "info";
  }
}

function DilaLabelItem({ info }: DilaLinkProps) {
  const context = [];
  if (/SCTA/.test(info.id) && info.parents.length > 2) {
    info.parents.slice(-2, -1).forEach((item) => context.push(<>{item}</>));
  }
  context.push(<DilaLink info={info}>{info.title}</DilaLink>);
  return jsxJoin(context, " › ");
}

type DilaLinkProps = {
  info: DilaAddedNode | DilaRemovedNode | DilaModifiedNode;
};
const DilaLink: React.FC<DilaLinkProps> = ({ info, children }) => {
  const { parents, id, title } = info;
  let url = "";
  const baseUrl = "https://legifrance.gouv.fr";
  // Sometimes, there is no id on the diff. So we can't create an URL.
  if (!id) {
    return <>{children && title}</>;
  }
  if (id.startsWith("LEGI")) {
    if (/ARTI/.test(id)) {
      // article d'un code
      const today = new Date();
      url = `${baseUrl}/codes/article_lc/${id}/${today.getUTCFullYear()}-${(
        "0" +
        (today.getUTCMonth() + 1)
      ).slice(-2)}-${today.getUTCDate()}`;
    } else {
      // section d'un code
      url = `${baseUrl}/codes/section_lc/${id}`;
    }
  }
  if (id.startsWith("KALI")) {
    if (/ARTI/.test(id)) {
      // article d'une CC ou teste annexe
      url = `${baseUrl}/conv_coll/article/${id} `;
    } else {
      // si section
      if (/^KALISCTA/.test(id)) {
        url = `${baseUrl}/conv_coll/section/id/${id}`;
        // si texte attaché/annexe
      } else if (/^KALITEXT/.test(id)) {
        url = `${baseUrl}/conv_coll/id/${id}`;
      }
    }
  }
  return (
    <a
      rel="nooppener noreferrer"
      target="_blank"
      href={url}
      title={parents && parents.join(" › ")}
    >
      {children && title}
    </a>
  );
};

type FicheLinkProps = {
  change: FicheTravailEmploiInfo | FicheVddInfo;
  documents?: DocumentInfoWithCdtnRef[];
};

function FicheLink({ change, documents = [] }: FicheLinkProps) {
  const docId = "url" in change ? change.pubId : change.id;

  const linkedDocuments = documents.flatMap((doc) => {
    if (doc.ref.id === docId) {
      return (
        <Link
          href={`/contenus/edit/${doc.id}`}
          passHref
          style={{ textDecoration: "none" }}
        >
          {doc.title}
        </Link>
      );
    }
    return [];
  });
  if ("url" in change) {
    return (
      <>
        <a
          target="_blank"
          aria-label={`${change.title} (nouvelle fenêtre)`}
          rel="noreferrer noopener"
          href={change.url}
        >
          {change.title}
        </a>

        {linkedDocuments.length > 0 && (
          <Box
            sx={{
              color: "muted",
              fontSize: "xsmall",
              lineHeight: 1,
            }}
          >
            Contenus liés : {jsxJoin(linkedDocuments, ", ")}
          </Box>
        )}
      </>
    );
  }
  const url = `https://www.service-public.fr/${change.type}/vosdroits/${change.id}`;
  return (
    <>
      <a
        target="_blank"
        aria-label={`${change.title} (nouvelle fenêtre)`}
        rel="noreferrer noopener"
        href={url}
      >
        {change.title}
      </a>
      {linkedDocuments.length > 0 && (
        <Box
          sx={{
            color: "muted",
            fontSize: "xsmall",
            lineHeight: 1,
          }}
        >
          Contenus liés : {jsxJoin(linkedDocuments, ", ")}
        </Box>
      )}
    </>
  );
}

let COLLAPSIBLE_ID = 1;
type ModificationViewerProps = {
  children: React.ReactNode;
};
export const ModificationViewer: React.FC<ModificationViewerProps> = ({
  children,
}) => {
  const [isVisible, setVisible] = useState(false);
  const id = `collapsible-component-${COLLAPSIBLE_ID++}`;
  return (
    <>
      <Button
        aria-controls={id}
        aria-expanded={isVisible}
        size="small"
        sx={{
          "&:hover": {
            color: "link",
          },
          cursor: "pointer",
          px: 0,
        }}
        onClick={() => setVisible(!isVisible)}
      >
        Voir les modifications{" "}
        {isVisible ? <IoIosArrowDown /> : <IoIosArrowForward />}
      </Button>
      {isVisible && (
        <Card id={id}>
          <Stack>{children}</Stack>
        </Card>
      )}
    </>
  );
};
