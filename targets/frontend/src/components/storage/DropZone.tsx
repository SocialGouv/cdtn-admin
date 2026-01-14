import { useCallback, type CSSProperties } from "react";
import { useDropzone, type FileWithPath } from "react-dropzone";
import { CircularProgress } from "@mui/material";
import { theme } from "../../theme";
import {
  ALLOWED_DOC,
  ALLOWED_JPG,
  ALLOWED_PDF,
  ALLOWED_PNG,
  ALLOWED_SVG,
} from "src/lib/secu";

const defaultStyles: CSSProperties = {
  border: "2px dotted silver",
  borderRadius: theme.space.small,
  padding: theme.space.medium,
};

type Props = {
  onDrop: (files: FormData) => void;
  uploading: boolean;
  customStyles?: CSSProperties;
};

export function DropZone({
  onDrop: onDropCallback,
  uploading,
  customStyles,
}: Props): React.ReactElement {
  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      const formData = new FormData();
      for (const file of acceptedFiles) {
        formData.append(file.path ?? file.name, file);
      }
      onDropCallback(formData);
    },
    [onDropCallback]
  );

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: {
      "image/png": ALLOWED_PNG,
      "image/jpeg": ALLOWED_JPG,
      "image/svg+xml": ALLOWED_SVG,
      "application/pdf": ALLOWED_PDF,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ALLOWED_DOC,
    },
    onDropAccepted: onDrop,
  });

  const styles: CSSProperties = {
    ...defaultStyles,
    ...(isDragAccept ? { backgroundColor: "dropZone" } : {}),
    ...customStyles,
  };

  return (
    <div {...getRootProps()} style={styles}>
      <input {...getInputProps()} />
      {uploading ? <CircularProgress /> : <p>Glissez vos fichiers ici</p>}
    </div>
  );
}
