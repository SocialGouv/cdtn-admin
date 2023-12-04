import { fr } from "@codegouvfr/react-dsfr";
import { BubbleMenu, Editor } from "@tiptap/react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import StorageIcon from "@mui/icons-material/Storage";
import LinkIcon from "@mui/icons-material/Link";

import { styled } from "@mui/system";

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
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
        type="button"
        title="Titre H2"
      >
        <BubbleMenuText>H2</BubbleMenuText>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "is-active" : ""}
        disabled={editor.isActive("details")}
        type="button"
        title="Titre H3"
      >
        <BubbleMenuText>H3</BubbleMenuText>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive("heading", { level: 4 }) ? "is-active" : ""}
        disabled={
          (!editor.getHTML().includes("<h3>") && !editor.isActive("details")) ||
          editor.isActive("heading", { level: 3 })
        }
        type="button"
        title="Titre H4"
      >
        <BubbleMenuText>H4</BubbleMenuText>
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
        title="Placer dans un accordéon"
      >
        <StorageIcon />
      </button>
      <button
        onClick={() => {
          setLink(editor);
        }}
        className={editor.isActive("link") ? "is-active" : ""}
        type="button"
        title="Faire un lien"
      >
        <LinkIcon />
      </button>
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
