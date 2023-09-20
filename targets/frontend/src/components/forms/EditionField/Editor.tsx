import { EditorContent, useEditor } from "@tiptap/react";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import { styled } from "@mui/system";
import { fr } from "@codegouvfr/react-dsfr";

import { TitleBox } from "../TitleBox";
import { MenuSpecial } from "./MenuSpecial";
import { MenuStyle } from "./MenuStyle";
import { MenuTable } from "./MenuTable";

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

const StyledEditorContent = styled(EditorContent)(() => {
  return {
    padding: "0 12px",
    ".ProseMirror:focus": {
      outline: "none",
    },
    table: {
      tBody: {
        borderColor: fr.colors.decisions.text.default.success.default,
      },
      th: {
        border: `1px solid ${fr.colors.decisions.text.default.grey.default}`,
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
        minWidth: "100px",
      },
      td: {
        border: `1px solid ${fr.colors.decisions.text.default.grey.default}`,
        textAlign: "center",
      },
    },
  };
});
