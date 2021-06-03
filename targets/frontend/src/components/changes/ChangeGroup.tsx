/** @jsxImportSource theme-ui */

import { AccordionItem, AccordionPanel } from "@reach/accordion";
import type {
  AlertChanges,
  DilaAddedNode,
  DilaAlertChanges,
  DilaModifiedNode,
  DilaRemovedNode,
  FicheTravailEmploiInfo,
  FicheVddInfo,
} from "@shared/types";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { Badge, Box, Card, Divider, NavLink } from "@theme-ui/components";
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
        <ul sx={{ margin: 0, px: "large" }}>{children}</ul>
      </AccordionPanel>
    </AccordionItem>
  );
};

type AlertRelatedDocumentsProps = {
  changes: DilaAlertChanges;
};

export function AlertRelatedDocuments({
  changes,
}: AlertRelatedDocumentsProps): JSX.Element {
  return (
    <>
      {changes.documents.map((item, i) => {
        const [title, anchor] = item.document.title.split("#");
        return (
          <li
            sx={{
              lineHeight: 1.4,
              paddingBottom: "xxsmall",
            }}
            key={`${changes.ref}-documents-${item.document.id})-${i}`}
          >
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://code.travail.gouv.fr/${getRouteBySource(
                item.document.source
              )}/${slugify(title)}${anchor ? `#${anchor}` : ``}`}
            >
              {title} {anchor}
            </a>
            <Box>
              {jsxJoin(
                item.references.map((node, i) => (
                  <NavLink
                    sx={{
                      color: "muted",
                      fontSize: "xsmall",
                      lineHeight: 1,
                    }}
                    href={node.url}
                    key={`${changes.ref}-${item.document.id}-${node.dila_id}-${node.title})-${i}`}
                  >
                    {node.title}
                  </NavLink>
                )),
                ", "
              )}
            </Box>
          </li>
        );
      })}
    </>
  );
}

type ChangesProps = {
  changes: AlertChanges;
};

export function AddedChanges({ changes }: ChangesProps): JSX.Element {
  switch (changes.type) {
    case "dila": {
      return (
        <>
          {changes.added.map((change) => (
            <li key={`${changes.ref}-${change.id}-added`}>
              <DilaLabelItem info={change} />{" "}
              <Badge sx={{ bg: getBadgeColor(change.etat), px: "xxsmall" }}>
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
              <FicheLink change={change} />
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
              <FicheLink change={change} />
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
                        px: "xxsmall",
                      }}
                    >
                      {statusUpdate.previousText}
                    </Badge>
                    {" › "}
                  </>
                )}
                <Badge sx={{ bg: getBadgeColor(change.etat), px: "xxsmall" }}>
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
                                inputA={diff.previousText}
                                inputB={diff.currentText}
                                type={"words"}
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
              <FicheLink change={change} />
              <ModificationViewer>
                {jsxJoin(
                  change.addedSections
                    .concat(change.removedSections, change.modifiedSections)
                    .map((diff) => {
                      return (
                        <>
                          <strong>{diff.title}</strong>
                          <ViewDiff
                            inputA={diff.previousText}
                            inputB={diff.currentText}
                            type={"words"}
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
              <FicheLink change={change} />
              <ModificationViewer>
                <strong>{change.title}</strong>
                <ViewDiff
                  inputA={change.previousText}
                  inputB={change.currentText}
                  type={"words"}
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
};

function FicheLink({ change }: FicheLinkProps) {
  if ("url" in change) {
    return (
      <a
        target="_blank"
        aria-label={`${change.title} (nouvelle fenêtre)`}
        rel="noreferrer noopener"
        href={change.url}
      >
        {change.title}
      </a>
    );
  }
  const url = `https://www.service-public.fr/${change.type}/vosdroits/${change.id}`;
  return (
    <a
      target="_blank"
      aria-label={`${change.title} (nouvelle fenêtre)`}
      rel="noreferrer noopener"
      href={url}
    >
      {change.title}
    </a>
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
        variant="link"
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
