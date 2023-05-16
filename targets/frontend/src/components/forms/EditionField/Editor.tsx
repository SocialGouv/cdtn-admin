import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect, useState } from "react";
import { FieldErrors } from "react-hook-form";
import styled from "styled-components";

import { TitleBox } from "../TitleBox";

export type EditorProps = {
  content?: string | null;
  onUpdate: (content: string) => void;
  error?: FieldErrors;
  disabled?: boolean;
};

export const Editor = ({ content, onUpdate, error, disabled }: EditorProps) => {
  const [focus, setFocus] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const editor = useEditor({
    content,
    editable: true,
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(html !== "<p></p>" ? html : "");
    },
  });
  useEffect(() => {
    setIsClient(true);
  });
  useEffect(() => {
    if (!editor) return;
    if (!content) {
      editor.commands.clearContent();
    }
  }, [editor, content]);
  useEffect(() => {
    editor?.setOptions({ editable: !disabled });
  }, [disabled]);

  return (
    <>
      {isClient && (
        <TitleBox title="Réponse" focus={focus}>
          {editor ? (
            <StyledBubbleMenu
              className="bubble-menu"
              tippyOptions={{ duration: 100 }}
              editor={editor}
            >
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={
                  editor.isActive("heading", { level: 2 }) ? "is-active" : ""
                }
                type="button"
              >
                <BubbleMenuText>H2</BubbleMenuText>
              </button>
              <button
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={
                  editor.isActive("heading", { level: 3 }) ? "is-active" : ""
                }
                type="button"
              >
                <BubbleMenuText>H3</BubbleMenuText>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "is-active" : ""}
                type="button"
              >
                <FormatBoldIcon />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "is-active" : ""}
                type="button"
              >
                <FormatItalicIcon />
              </button>
            </StyledBubbleMenu>
          ) : (
            <></>
          )}

          {editor ? (
            <StyledFloatingMenu
              className="floating-menu"
              tippyOptions={{ duration: 100 }}
              editor={editor}
            >
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive("bulletList") ? "is-active" : ""}
                type="button"
              >
                <FormatListBulletedIcon />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive("orderedList") ? "is-active" : ""}
                type="button"
              >
                <FormatListNumberedIcon />
              </button>
            </StyledFloatingMenu>
          ) : (
            <></>
          )}

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
`;

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

const BubbleMenuText = styled.div`
  font-size: 18px;
  padding-bottom: 2px;
`;
