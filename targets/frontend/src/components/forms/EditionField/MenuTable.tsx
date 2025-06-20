import { Editor, FloatingMenu } from "@tiptap/react";
import Delete from "@mui/icons-material/Delete";
import {
  DeleteColumn,
  DeleteRow,
  InsertColumnLeft,
  InsertColumnRight,
  InsertRowBottom,
  InsertRowTop,
} from "./icons";
import { styled } from "@mui/system";

export const MenuTable = ({ editor }: { editor: Editor | null }) => {
  return editor ? (
    <TableFloatingMenu
      className="floating-menu"
      tippyOptions={{ duration: 100, maxWidth: 500 }}
      editor={editor}
      shouldShow={({ editor: _editor }) => _editor.isActive("table")}
    >
      <button
        onClick={() => editor.chain().focus().addColumnBefore().run()}
        disabled={!editor.can().addColumnBefore()}
        type="button"
        title="Ajouter une colonne à gauche"
      >
        <InsertColumnLeft width={24} fill="white" />
      </button>
      <button
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        disabled={!editor.can().addColumnAfter()}
        type="button"
        title="Ajouter une colonne à droite"
      >
        <InsertColumnRight width={24} fill="white" />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteColumn().run()}
        disabled={!editor.can().deleteColumn()}
        type="button"
        title="Supprimer la colonne"
      >
        <DeleteColumn width={24} fill="white" />
      </button>
      <button
        onClick={() => editor.chain().focus().addRowBefore().run()}
        disabled={!editor.can().addRowBefore()}
        type="button"
        title="Ajouter une ligne au dessus"
      >
        <InsertRowTop width={24} fill="white" />
      </button>
      <button
        onClick={() => editor.chain().focus().addRowAfter().run()}
        disabled={!editor.can().addRowAfter()}
        type="button"
        title="Ajouter une ligne en dessous"
      >
        <InsertRowBottom width={24} fill="white" />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteRow().run()}
        disabled={!editor.can().deleteRow()}
        type="button"
        title="Supprimer la ligne"
      >
        <DeleteRow width={24} fill="white" />
      </button>
      <button
        onClick={() => editor.chain().focus().deleteTable().run()}
        disabled={!editor.can().deleteTable()}
        type="button"
        title="Supprimer le tableau"
      >
        <Delete />
      </button>
    </TableFloatingMenu>
  ) : (
    <></>
  );
};

const TableFloatingMenu = styled(FloatingMenu)`
  display: flex;
  background-color: #0d0d0d;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;
    color: #fff;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
`;
