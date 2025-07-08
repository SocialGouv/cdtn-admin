import { Editor, FloatingMenu } from "@tiptap/react";
import Delete from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "@mui/system";

export const MenuInfographic = ({
  editor,
  onEdit,
  onDelete,
}: {
  editor: Editor | null;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return editor ? (
    <InfographicFloatingMenu
      className="floating-menu"
      tippyOptions={{ duration: 100, maxWidth: 500 }}
      editor={editor}
      shouldShow={({ editor: editorInstance, state }) => {
        return (
          editorInstance?.state.selection.$from.node()?.type.name ===
            "infographic" &&
          state.selection.content().content.size > 0 &&
          editorInstance.isActive("infographic")
        );
      }}
    >
      <button onClick={onEdit} type="button" title="Editer l'infographie">
        <EditIcon width={24} fill="white" />
      </button>
      <button onClick={onDelete} type="button" title="Supprimer l'infographie">
        <Delete />
      </button>
    </InfographicFloatingMenu>
  ) : (
    <></>
  );
};

const InfographicFloatingMenu = styled(FloatingMenu)`
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
