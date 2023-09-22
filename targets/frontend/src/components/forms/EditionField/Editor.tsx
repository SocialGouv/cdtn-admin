import { EditorContent, useEditor } from "@tiptap/react";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import { styled } from "@mui/system";

import { TitleBox } from "../TitleBox";
import { MenuSpecial } from "./MenuSpecial";
import { MenuStyle } from "./MenuStyle";
import { MenuTable } from "./MenuTable";
import { Details } from "@tiptap-pro/extension-details";
import { DetailsSummary } from "@tiptap-pro/extension-details-summary";
import { DetailsContent } from "@tiptap-pro/extension-details-content";
import { Placeholder } from "@tiptap/extension-placeholder";

export type EditorProps = {
  content?: string | null;
  onUpdate: (content: string) => void;
  error?: FieldErrors;
  disabled?: boolean;
};

const emptyHtml = "<p></p>";

export const Editor = ({ content, onUpdate, error, disabled }: EditorProps) => {
  const [focus, setFocus] = useState(false);
  const [isClient, setIsClient] = useState(false);
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
        placeholder: ({ node }) => {
          if (node.type.name === "detailsSummary") {
            return "Titre de la section";
          }
          return "";
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
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

  return (
    <>
      {isClient && (
        <TitleBox title="Réponse" focus={focus} disabled={disabled}>
          <MenuStyle editor={editor} />
          <MenuSpecial editor={editor} />
          <MenuTable editor={editor} />

          <StyledEditorContent
            editor={editor}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            disabled={disabled}
          />
        </TitleBox>
      )}
    </>
  );
};

const StyledEditorContent = styled(EditorContent)`
  padding: 0 12px;

  .ProseMirror:focus {
    outline: none;
  }

  table {
    th {
      background-color: #f3f3f3;
      min-width: 100px;
    }

    td {
      border: 1px solid black;
      text-align: center;
    }
  }

  .ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }

    .is-empty::before {
      content: attr(data-placeholder);
      float: left;
      color: #adb5bd;
      pointer-events: none;
      height: 0;
    }

    .details {
      display: flex;
      margin: 1rem 0;
      border: 0;
      padding: 0.5rem;

      > button {
        display: flex;
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 0;

        &::before {
          content: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBjbGFzcz0ic2MtaW1XWUFJIGpFTHpJTCI+PHBvbHlsaW5lIHBvaW50cz0iOSAxOCAxNSAxMiA5IDYiIHN0cm9rZT0iIzZmOGFjOSI+PC9wb2x5bGluZT48L3N2Zz4=");
          display: flex;
          justify-content: center;
          align-items: center;
          color: #6f8ac9;
          font-weight: bold;
          width: 2.5em;
          height: 2em;
        }
      }

      &.is-open > button::before {
        content: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBjbGFzcz0ic2MtaW1XWUFJIGpFTHpJTCI+PHBvbHlsaW5lIHBvaW50cz0iOSAxOCAxNSAxMiA5IDYiIHN0cm9rZT0iIzZmOGFjOSI+PC9wb2x5bGluZT48L3N2Zz4=");
        transform: rotate(90deg);
      }

      > div {
        flex: 1 1 auto;
      }

      :last-child {
        margin-bottom: 0;
      }
    }
  }
`;
