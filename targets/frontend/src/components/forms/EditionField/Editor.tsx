import { EditorContent, Extensions, useEditor } from "@tiptap/react";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { gql, useQuery } from "urql";

import { TitleBox } from "../TitleBox";
import { MenuSpecial } from "./MenuSpecial";
import { MenuStyle } from "./MenuStyle";
import { MenuTable } from "./MenuTable";
import { Details } from "@tiptap-pro/extension-details";
import { DetailsSummary } from "@tiptap-pro/extension-details-summary";
import { DetailsContent } from "@tiptap-pro/extension-details-content";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Alert, Challenger, Infographic, Title } from "./extensions";

const smicQuery = gql`
  query SmicCurrentValueEditor {
    reference_value_smic_values(order_by: { applicationDate: desc }) {
      id
      hourlyValue
      applicationDate
    }
  }
`;
type SmicEditorRow = {
  id: string;
  hourlyValue: number;
  applicationDate: string;
};
type SmicEditorResult = { reference_value_smic_values: SmicEditorRow[] };
import { NodeSelection } from "@tiptap/pm/state";
import { AddInfographyDialog } from "./component/AddInfographyDialog";
import { ChallengerDialog } from "./component/ChallengerDialog";
import {
  BulkChallengerDialog,
  detectAmountsInRange,
} from "./component/BulkChallengerDialog";
import { ChallengerFormula } from "@socialgouv/cdtn-utils";

export type EditorProps = {
  label: string;
  content?: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
  isError?: boolean;
  infographicEnabled: boolean;
  infographicBaseUrl: string;
  onInfographicChange?: (infoId: string, state: "added" | "deleted") => void;
  challengerEnabled?: boolean;
};

const emptyHtml = "<p></p>";

export const defaultExtensions: Extensions = [
  StarterKit,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Details.configure({
    persist: false,
    HTMLAttributes: {
      class: "details",
    },
  }),
  DetailsSummary,
  DetailsContent,
  Placeholder.configure({
    includeChildren: true,
    placeholder: ({ node }) => {
      if (node.type.name === "detailsSummary") {
        return "Titre de la section";
      }
      return "";
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      rel: null,
    },
  }),
  Alert,
  Title,
];

type ChallengerDialogState = {
  open: boolean;
  selectedText: string;
  existingFormula: ChallengerFormula | null;
  existingParameter: string | null;
};

type BulkChallengerDialogState = {
  open: boolean;
  range: { from: number; to: number } | null;
};

export const Editor = function Editor({
  label,
  content,
  onUpdate,
  disabled,
  infographicBaseUrl,
  isError = false,
  infographicEnabled,
  onInfographicChange,
  challengerEnabled = false,
}: EditorProps) {
  const [smicResult] = useQuery<SmicEditorResult>({
    query: smicQuery,
    requestPolicy: "cache-and-network",
    pause: !challengerEnabled,
  });
  const today = new Date().toISOString().split("T")[0];
  const allSmic = smicResult.data?.reference_value_smic_values ?? [];
  const currentSmic = allSmic.find((v) => v.applicationDate <= today) ?? null;

  const [currentContent, setCurrentContent] = useState(content);
  const [focus, setFocus] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isInfoModalOpened, openInfoModal] = useState<boolean>(false);
  const [challengerDialog, setChallengerDialog] =
    useState<ChallengerDialogState>({
      open: false,
      selectedText: "",
      existingFormula: null,
      existingParameter: null,
    });
  const [bulkChallengerDialog, setBulkChallengerDialog] =
    useState<BulkChallengerDialogState>({
      open: false,
      range: null,
    });

  const editor = useEditor({
    content,
    editable: !disabled,
    extensions: [
      ...defaultExtensions,
      ...(infographicEnabled
        ? [Infographic.configure({ baseUrl: infographicBaseUrl })]
        : []),
      ...(challengerEnabled ? [Challenger] : []),
    ],
    onUpdate: ({ editor, transaction }) => {
      if (infographicEnabled && onInfographicChange && transaction.docChanged) {
        // Detect if an infography has been deleted or added
        transaction.steps.forEach((step) => {
          const from = (step as any).from;
          const to = (step as any).to;

          transaction.before.nodesBetween(from, to, (node) => {
            if (node.type.name === "infographic") {
              onInfographicChange(node.attrs.infoId, "deleted");
            }
          });

          if ((step as any).slice) {
            (step as any).slice.content.descendants((node: any) => {
              if (node.type.name === "infographic") {
                onInfographicChange(node.attrs.infoId, "added");
              }
            });
          }
        });
      }
      const html = editor.getHTML();
      setCurrentContent(html);
      onUpdate(html !== emptyHtml ? html : "");
    },
  });
  if (content && editor?.getHTML() === emptyHtml) {
    editor?.commands.insertContent(content);
  }
  useEffect(() => {
    setIsClient(true);
  });
  useEffect(() => {
    if (!editor) return;
    if (!content) {
      editor.commands.clearContent();
    }
  }, [content]);
  useEffect(() => {
    editor?.setOptions({ editable: !disabled });
  }, [disabled]);

  useEffect(() => {
    if (!editor || !challengerEnabled) return;
    const ext = editor.extensionManager.extensions.find(
      (e) => e.name === "challenger"
    );
    if (!ext) return;
    ext.storage.smicHourly = currentSmic?.hourlyValue ?? null;
    // Dispatch a no-op transaction to trigger re-decoration
    editor.view.dispatch(editor.state.tr);
  }, [editor, currentSmic?.hourlyValue, challengerEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Clic sur un montant challengé : ouvrir la dialog de modification.
      // On cible aussi le wrapper de décoration (span[data-challenger-computed])
      // qui est l'élément visible quand le SMIC est disponible.
      if (
        challengerEnabled &&
        !disabled &&
        editor &&
        (target.closest("span.challenger") !== null ||
          target.closest("span[data-challenger-computed]") !== null)
      ) {
        const coords = editor.view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (coords) {
          editor
            .chain()
            .focus()
            .setTextSelection(coords.pos)
            .extendMarkRange("challenger")
            .run();
          const { from, to } = editor.state.selection;
          const selectedText = editor.state.doc.textBetween(from, to);
          const attrs = editor.getAttributes("challenger");
          if (attrs.formula) {
            setChallengerDialog({
              open: true,
              selectedText,
              existingFormula: attrs.formula as ChallengerFormula,
              existingParameter: attrs.parameter ?? null,
            });
          }
        }
        return;
      }

      // We need to focus on the infographic to edit it
      if (
        target.tagName === "IMG" &&
        target.closest(".infographic") &&
        editor
      ) {
        const pos = editor.view.posAtDOM(
          target.closest(".infographic") as HTMLElement,
          0
        );

        editor.view.dispatch(
          editor.state.tr.setSelection(
            NodeSelection.create(editor.state.doc, pos)
          )
        );
        editor.commands.focus();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [editor, challengerEnabled, disabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {isClient && (
        <TitleBox
          title={label}
          focus={focus}
          isError={isError}
          disabled={disabled}
          htmlFor={label}
        >
          <MenuStyle
            editor={editor}
            challengerEnabled={challengerEnabled}
            onChallenger={(from, to) => {
              if (!editor) return;
              const detected = detectAmountsInRange(editor, from, to);
              if (detected.length === 1) {
                const amount = detected[0];
                editor
                  .chain()
                  .focus()
                  .setTextSelection({ from: amount.from, to: amount.to })
                  .run();
                const attrs = editor.getAttributes("challenger");
                setChallengerDialog({
                  open: true,
                  selectedText: amount.rawText,
                  existingFormula: (attrs.formula as ChallengerFormula) ?? null,
                  existingParameter: attrs.parameter ?? null,
                });
              } else {
                setBulkChallengerDialog({
                  open: true,
                  range: { from, to },
                });
              }
            }}
          />
          <MenuSpecial
            editor={editor}
            infographicEnabled={infographicEnabled}
            onNewInfographic={() => {
              openInfoModal(true);
            }}
          />
          <MenuTable editor={editor} />

          <StyledEditorContent
            editor={editor}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            disabled={disabled}
          />
          <input
            id={label}
            value={currentContent}
            aria-hidden={true}
            className={"fr-hidden"}
          />
        </TitleBox>
      )}
      {infographicEnabled && (
        <AddInfographyDialog
          open={isInfoModalOpened}
          baseUrl={infographicBaseUrl}
          onClose={() => {
            openInfoModal(false);
          }}
          onAdd={(infoId, infoFileName) => {
            editor?.chain().focus().setInfographic(infoId, infoFileName).run();
            openInfoModal(false);
          }}
        />
      )}
      {challengerEnabled && (
        <>
          <ChallengerDialog
            open={challengerDialog.open}
            selectedText={challengerDialog.selectedText}
            existingFormula={challengerDialog.existingFormula}
            existingParameter={challengerDialog.existingParameter}
            onConfirm={(formula, parameter) => {
              editor?.chain().focus().setChallenger(formula, parameter).run();
              setChallengerDialog((s) => ({ ...s, open: false }));
            }}
            onRemove={() => {
              editor?.chain().focus().unsetChallenger().run();
              setChallengerDialog((s) => ({ ...s, open: false }));
            }}
            onClose={() => setChallengerDialog((s) => ({ ...s, open: false }))}
          />
          <BulkChallengerDialog
            open={bulkChallengerDialog.open}
            editor={editor}
            range={bulkChallengerDialog.range}
            onClose={() =>
              setBulkChallengerDialog((s) => ({ ...s, open: false }))
            }
          />
        </>
      )}
    </>
  );
};

const StyledEditorContent = styled(EditorContent)(() => {
  return {
    padding: "0 12px",
    ".ProseMirror": {
      ":focus": {
        outline: "none",
      },
      "> * + *": {
        marginTop: "0.75em",
      },
      ".is-empty::before": {
        content: "attr(data-placeholder)",
        float: "left",
        color: "#adb5bd",
        pointerEvents: "none",
        height: "0",
      },
      "a::after": {
        display: "none",
      },
      "span.title": {
        fontSize: "1.75rem",
        fontWeight: 700,
        display: "block",
        padding: "O.5rem 0",
      },
      "span.sub-title": {
        fontSize: "1.5rem",
        fontWeight: 700,
        display: "block",
        padding: "O.5rem 0",
      },
      ".alert": {
        marginBottom: "1.6rem",
        padding: "1.6rem 2rem",
        color: fr.colors.decisions.text.default,
        fontSize: "1.4rem",
        backgroundColor: fr.colors.decisions.background.contrast.info.active,
        borderRadius: "0.6rem",
      },
      ".infographic": {
        marginBottom: "1.6rem",
        color: fr.colors.decisions.text.default,
      },
      // Challenger sans valeur SMIC disponible : affichage original
      "span.challenger": {
        borderBottom: "2px dashed #0053b3",
        paddingBottom: "1px",
        cursor: "help",
      },
      // Décoration ProseMirror : wrapper ajouté quand le SMIC est disponible.
      // Affiche la valeur calculée dynamiquement (jamais persistée dans le HTML).
      "span[data-challenger-computed]": {
        fontSize: "0px",
        "& span.challenger": {
          borderBottom: "none",
          paddingBottom: "0",
          "&::after": {
            content: "none",
          },
        },
        "&::before": {
          content: "attr(data-challenger-computed)",
          fontSize: "1rem",
          color: "#0053b3",
          borderBottom: "2px dashed #0053b3",
          paddingBottom: "1px",
          cursor: "help",
        },
        "&::after": {
          content: '" ⚖"',
          fontSize: "11px",
          color: "#0053b3",
          verticalAlign: "super",
        },
      },
      ".ProseMirror-selectednode": {
        border: "1px solid #6f8ac9",
      },
      li: {
        p: {
          margin: "0",
        },
      },
      ".details": {
        display: "flex",
        border: "0",
        padding: "1rem 0",
        borderTop: `1px solid ${fr.colors.decisions.text.default.grey.default}`,
        ":first-of-type": {
          border: "none",
        },
        summary: {
          fontWeight: 600,
          fontSize: "1.3rem",
          fontFamily: '"Open Sans", sans-serif',
        },
        "> button": {
          display: "flex",
          cursor: "pointer",
          background: "transparent",
          border: "none",
          padding: "0",
          "&::before": {
            content:
              'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBjbGFzcz0ic2MtaW1XWUFJIGpFTHpJTCI+PHBvbHlsaW5lIHBvaW50cz0iOSAxOCAxNSAxMiA5IDYiIHN0cm9rZT0iIzZmOGFjOSI+PC9wb2x5bGluZT48L3N2Zz4=")',
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#6f8ac9",
            fontWeight: "bold",
            width: "2.5em",
            height: "2em",
          },
        },
        "&.is-open > button::before": {
          content:
            'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBjbGFzcz0ic2MtaW1XWUFJIGpFTHpJTCI+PHBvbHlsaW5lIHBvaW50cz0iOSAxOCAxNSAxMiA5IDYiIHN0cm9rZT0iIzZmOGFjOSI+PC9wb2x5bGluZT48L3N2Zz4=")',
          transform: "rotate(90deg)",
        },
        "> div": {
          flex: "1 1 auto",
        },
        ":last-child": {
          marginBottom: "0",
        },
      },
    },
    table: {
      tBody: {
        borderColor: fr.colors.decisions.text.default.success.default,
      },
      th: {
        border: `1px solid ${fr.colors.decisions.text.default.grey.default}`,
        backgroundColor: fr.colors.decisions.background.default.grey.default,
        minWidth: "100px",
      },
      td: {
        border: `1px solid ${fr.colors.decisions.text.default.grey.default}`,
        textAlign: "center",
      },
    },
  };
});
