import {EditorContent, useEditor} from "@tiptap/react";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import React, {useEffect, useState} from "react";
import {styled} from "@mui/system";
import {fr} from "@codegouvfr/react-dsfr";

import {TitleBox} from "../TitleBox";
import {MenuSpecial} from "./MenuSpecial";
import {MenuStyle} from "./MenuStyle";
import {MenuTable} from "./MenuTable";
import {Details} from "@tiptap-pro/extension-details";
import {DetailsSummary} from "@tiptap-pro/extension-details-summary";
import {DetailsContent} from "@tiptap-pro/extension-details-content";
import {Placeholder} from "@tiptap/extension-placeholder";
import {Link} from "@tiptap/extension-link";
import {Alert, Infographic, Title} from "./extensions";
import {MenuInfographic} from "./MenuInfographic";
import {Button, DialogActions, DialogContentText, TextField,} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {NodeSelection} from "@tiptap/pm/state";

export type EditorProps = {
  label: string;
  content?: string;
  onUpdate: (content: string) => void;
  disabled?: boolean;
  isError?: boolean;
  infographicBaseUrl: string;
};

const emptyHtml = "<p></p>";

type ModeCreation = {
  mode: 0;
};
const Creation: ModeCreation = {mode: 0};

type ModeEdition = {
  mode: 1;
  infoTitle: string;
  infoName: string;
  pdfName: string;
  pdfSize: string;
};
const Edition = (
  infoTitle: string,
  infoName: string,
  pdfName: string,
  pdfSize: string
): ModeEdition => ({
  mode: 1,
  infoTitle,
  infoName,
  pdfName,
  pdfSize,
});

type ModeHide = {
  mode: -1;
};
const Hide: ModeHide = {mode: -1};

type Mode = ModeEdition | ModeCreation | ModeHide;

export const Editor = ({
                         label,
                         content,
                         onUpdate,
                         disabled,
                         infographicBaseUrl,
                         isError = false,
                       }: EditorProps) => {
  const [currentContent, setCurrentContent] = useState(content);
  const [focus, setFocus] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [infographicModal, setInfographicModal] = useState<Mode>(Hide);

  const editor = useEditor({
    content,
    editable: !disabled,
    extensions: [
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
        placeholder: ({node}) => {
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
      Infographic.configure({
        baseUrl: infographicBaseUrl,
      }),
    ],
    onUpdate: ({editor}) => {
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
    editor?.setOptions({editable: !disabled});
  }, [disabled]);

  useEffect(() => {
    // We need to focus on the infographic to edit it
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

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
  }, [editor]);

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
          <MenuStyle editor={editor}/>
          <MenuSpecial
            editor={editor}
            onNewInfographic={() => {
              setInfographicModal(Creation);
            }}
          />
          <MenuTable editor={editor}/>
          <MenuInfographic
            editor={editor}
            onEdit={() => {
              const node = editor?.state.selection.$from.node();
              if (node?.type.name === "infographic") {
                const infoTitle = node.attrs.infoTitle;
                const infoName = node.attrs.infoName;
                const dataPdf = node.attrs.pdfName;
                const dataPdfSize = node.attrs.pdfSize;
                setInfographicModal(Edition(infoTitle, infoName, dataPdf, dataPdfSize));
              }
            }}
            onDelete={() => {
              editor?.commands.removeInfographic();
            }}
          />

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
      <Dialog
        open={infographicModal.mode !== Hide.mode}
        onClose={() => {
          setInfographicModal(Hide);
        }}
        PaperProps={{
          component: "form",
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const {infoTitle, infoName, pdfName, pdfSize} = Object.fromEntries(
              (formData as any).entries()
            );
            if (infographicModal.mode === Creation.mode) {
              editor
                ?.chain()
                .focus()
                .setInfographic(infoTitle, infoName, pdfName, pdfSize)
                .run();
            } else {
              editor?.commands.updateInfographicSrc(infoTitle, infoName, pdfName, pdfSize);
            }
            setInfographicModal(Hide);
          },
        }}
      >
        <DialogTitle>Infographie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez renseigner les informations suivantes pour ajouter une
            infographie au document
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="infoTitle"
            name="infoTitle"
            label="Nom de l'infographie"
            defaultValue={
              infographicModal.mode === 1
                ? infographicModal.infoTitle
                : undefined
            }
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="infoName"
            name="infoName"
            label="Nom du fichier contenant l'image de l'infographie"
            defaultValue={
              infographicModal.mode === 1
                ? infographicModal.infoName
                : undefined
            }
            type="text"
            fullWidth
            variant="standard"
            helperText={"Exemple : MIN_Travail_Emploi_RVB.svg"}
          />
          <TextField
            required
            margin="dense"
            id="pdfName"
            name="pdfName"
            label="Nom du fichier contenant le PDF"
            defaultValue={
              infographicModal.mode === 1 ? infographicModal.pdfName : undefined
            }
            type="text"
            fullWidth
            variant="standard"
            helperText={"Exemple : MIN_Travail_Emploi_RVB.pdf"}
          />
          <TextField
            required
            margin="dense"
            id="pdfSize"
            name="pdfSize"
            label="Taille du PDF en Ko"
            defaultValue={
              infographicModal.mode === 1 ? infographicModal.pdfSize : undefined
            }
            type="number"
            fullWidth
            variant="standard"
            helperText="Exemple : 320"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInfographicModal(Hide);
            }}
          >
            Annuler
          </Button>
          <Button type="submit" variant="contained">
            {infographicModal.mode === Creation.mode ? "Ajouter" : "Modifier"}
          </Button>
        </DialogActions>
      </Dialog>
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
