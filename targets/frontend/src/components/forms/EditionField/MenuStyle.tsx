import { fr } from "@codegouvfr/react-dsfr";
import { BubbleMenu, Editor } from "@tiptap/react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import StorageIcon from "@mui/icons-material/Storage";
import LinkIcon from "@mui/icons-material/Link";

import { styled } from "@mui/system";
import InfoIcon from "@mui/icons-material/Info";
import Delete from "@mui/icons-material/Delete";

const setLink = (editor: Editor) => {
  const previousUrl = editor.getAttributes("link").href;
  const url = window.prompt("URL", previousUrl);

  // cancelled
  if (url === null) {
    return;
  }

  // empty
  if (url === "") {
    editor.chain().focus().unsetLink().run();

    return;
  }
  // update link
  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .updateAttributes("a", { rel: null })
    .setLink({ href: url })
    .run();
};

export const MenuStyle = ({ editor }: { editor: Editor | null }) => {
  return editor ? (
    <StyledBubbleMenu
      className="bubble-menu"
      tippyOptions={{ duration: 100 }}
      editor={editor}
    >
      <button
        onClick={() =>
          editor.chain().focus().toggleTitle({ level: "title" }).run()
        }
        className={
          editor.isActive("title", { level: "title" }) ? "is-active" : ""
        }
        type="button"
        title="Titre"
      >
        <BubbleMenuText>T</BubbleMenuText>
      </button>
      <button
        onClick={() =>
          editor.chain().focus().toggleTitle({ level: "sub-title" }).run()
        }
        className={
          editor.isActive("title", { level: "sub-title" }) ? "is-active" : ""
        }
        disabled={!editor.getHTML().includes('"title"')}
        type="button"
        title="Sous-titre"
      >
        <BubbleMenuText>ST</BubbleMenuText>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "is-active" : ""}
        type="button"
        title="Gras"
      >
        <FormatBoldIcon />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "is-active" : ""}
        type="button"
        title="Italique"
      >
        <FormatItalicIcon />
      </button>
      <button
        onClick={() => {
          editor.chain().focus().setDetails().run();
        }}
        className={editor.isActive("details") ? "is-active" : ""}
        type="button"
        title="Accordéon"
      >
        <StorageIcon />
      </button>
      <button
        onClick={() => {
          setLink(editor);
        }}
        className={editor.isActive("link") ? "is-active" : ""}
        type="button"
        title="Lien"
      >
        <LinkIcon />
      </button>
      <button
        onClick={() => {
          editor?.chain().focus().setAlert().run();
        }}
        className={editor.isActive("alert") ? "is-active" : ""}
        type="button"
        title="Section d'alerte"
        disabled={editor.isActive("alert")}
      >
        <InfoIcon />
      </button>
      {editor.isActive("infographic") && (
        <button
          onClick={() => {
            editor?.chain().focus().removeInfographic().run();
          }}
          className={editor.isActive("infographic") ? "is-active" : ""}
          type="button"
          title="Supprimer l'infographie"
        >
          <Delete />
        </button>
      )}
    </StyledBubbleMenu>
  ) : (
    <></>
  );
};

const StyledBubbleMenu = styled(BubbleMenu)`
  display: flex;
  background-color: ${fr.colors.decisions.background.contrast.grey.default};
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    color: ${fr.colors.decisions.text.default.grey.default};
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    svg {
      margin-top: 3px;
    }

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
`;

const BubbleMenuText = styled("div")`
  font-size: 18px;
  padding-bottom: 2px;
`;
