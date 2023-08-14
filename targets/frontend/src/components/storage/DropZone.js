import PropTypes from "prop-types";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Input, CircularProgress } from "@mui/material";

const defaultStyles = {
  border: "2px dotted silver",
  borderRadius: "small",
  p: "medium",
};

export function DropZone({ onDrop: onDropCallback, uploading, customStyles }) {
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
    accept:
      "image/jpeg, image/svg+xml, image/png, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    onDrop,
  });

  if (isDragAccept) {
    defaultStyles.backgroundColor = "dropZone";
  } else {
    delete defaultStyles.backgroundColor;
  }
  return (
    <Box {...getRootProps()} sx={{ ...defaultStyles, ...customStyles }}>
      <Input {...getInputProps()} />
      {uploading ? <CircularProgress /> : <p>Glissez vos fichiers ici</p>}
    </Box>
  );
}

DropZone.propTypes = {
  customStyles: PropTypes.object,
  onDrop: PropTypes.func.isRequired,
  uploading: PropTypes.bool.isRequired,
};
