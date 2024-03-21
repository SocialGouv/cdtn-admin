import CSS from "csstype";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgress } from "@mui/material";
import { theme } from "../../theme";
import {
  ALLOWED_DOC,
  ALLOWED_JPG,
  ALLOWED_PDF,
  ALLOWED_PNG,
  ALLOWED_SVG,
} from "src/lib/secu";

const defaultStyles: CSS.Properties = {
  border: "2px dotted silver",
  borderRadius: theme.space.small,
  padding: theme.space.medium,
};

type Props = {
  onDrop: (files: FormData) => void;
  uploading: boolean;
  customStyles?: CSS.Properties;
};

export function DropZone({
  onDrop: onDropCallback,
  uploading,
  customStyles,
}: Props): React.ReactElement {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      const formData = new FormData();
      for (const i in acceptedFiles) {
        if (acceptedFiles[i] instanceof File) {
          formData.append(acceptedFiles[i].path, acceptedFiles[i]);
        }
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

  if (isDragAccept) {
    defaultStyles.backgroundColor = "dropZone";
  } else {
    delete defaultStyles.backgroundColor;
  }
  return (
    <div {...getRootProps()} style={{ ...defaultStyles, ...customStyles }}>
      <input {...getInputProps()} />
      {uploading ? <CircularProgress /> : <p>Glissez vos fichiers ici</p>}
    </div>
  );
}
