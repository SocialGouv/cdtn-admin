import { BubbleMenu, Editor } from "@tiptap/react";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import StorageIcon from "@mui/icons-material/Storage";
import { styled } from "@mui/system";

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
        type="button"
        title="Titre H3"
      >
        <BubbleMenuText>H3</BubbleMenuText>
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
    </StyledBubbleMenu>
  ) : (
    <></>
  );
};

const StyledBubbleMenu = styled(BubbleMenu)`
  display: flex;
  background-color: #0d0d0d;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    color: #fff;
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

const BubbleMenuText = styled("div")`
  font-size: 18px;
  padding-bottom: 2px;
`;
