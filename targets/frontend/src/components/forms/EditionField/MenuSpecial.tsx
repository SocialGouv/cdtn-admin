import {
  Editor,
  FloatingMenu,
  getText,
  getTextSerializersFromSchema,
} from "@tiptap/react";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import GridOnIcon from "@mui/icons-material/GridOn";
import StorageIcon from "@mui/icons-material/Storage";
import { styled } from "@mui/system";
import InfoIcon from "@mui/icons-material/Info";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

const tableHTML = `
  <table style="width:100%">
    <tr>
      <th>Titre 1</th>
      <th>Titre 2</th>
    </tr>
    <tr>
      <td>Colonne 1</td>
      <td>Colonne 2</td>
    </tr>
  </table>
`;

export const MenuSpecial = ({ editor }: { editor: Editor | null }) => {
  const getTextContent = (node: ProseMirrorNode) => {
    if (editor) {
      return getText(node, {
        textSerializers: getTextSerializersFromSchema(editor.schema),
      });
    }
  };

  return editor ? (
    <StyledFloatingMenu
      className="floating-menu"
      tippyOptions={{ duration: 100 }}
      editor={editor}
      shouldShow={({ editor, view, state }) => {
        // Code extracted from the plugin : https://github.com/ueberdosis/tiptap/blob/main/packages/extension-floating-menu/src/floating-menu-plugin.ts#L74
        const { selection } = state;
        const { $anchor, empty } = selection;
        // Ici on autorise à afficher le menu à tout les niveaux sauf dans les listes et les tableaux
        const isRootDepth = !(
          editor.isActive("orderedList") ||
          editor.isActive("bulletList") ||
          editor.isActive("table")
        );

        const isEmptyTextBlock =
          $anchor.parent.isTextblock &&
          !$anchor.parent.type.spec.code &&
          !$anchor.parent.textContent &&
          $anchor.parent.childCount === 0 &&
          !getTextContent($anchor.parent);

        return !(
          !view.hasFocus() ||
          !empty ||
          !isRootDepth ||
          !isEmptyTextBlock ||
          !editor.isEditable
        );
      }}
    >
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "is-active" : ""}
        type="button"
        title="Liste"
      >
        <FormatListBulletedIcon />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
        type="button"
        title="Liste numérotée"
      >
        <FormatListNumberedIcon />
      </button>
      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertContent(tableHTML, {
              parseOptions: {
                preserveWhitespace: false,
              },
            })
            .run()
        }
        className={editor.isActive("orderedList") ? "is-active" : ""}
        type="button"
        title="Tableau"
      >
        <GridOnIcon />
      </button>
      <button
        onClick={() => editor.chain().focus().setDetails().run()}
        className={editor.isActive("details") ? "is-active" : ""}
        type="button"
        title="Accordéon"
      >
        <StorageIcon />
      </button>
      <button
        onClick={() => {
          editor?.chain().focus().setAlert().run();
        }}
        className={editor.isActive("alert") ? "is-active" : ""}
        type="button"
        title="Section d'alerte"
      >
        <InfoIcon />
      </button>
    </StyledFloatingMenu>
  ) : (
    <></>
  );
};

const StyledFloatingMenu = styled(FloatingMenu)`
  display: flex;
  background-color: #0d0d0d10;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
`;
