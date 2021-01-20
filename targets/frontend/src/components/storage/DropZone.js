import PropTypes from "prop-types";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Spinner } from "theme-ui";

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
      "image/jpeg, image/png, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    onDrop,
  });

  if (isDragAccept) {
    defaultStyles.backgroundColor = "dropZone";
  } else {
    delete defaultStyles.backgroundColor;
  }
  return (
    <div {...getRootProps()} sx={{ ...defaultStyles, ...customStyles }}>
      <input {...getInputProps()} />
      {uploading ? <Spinner /> : <p>Glissez vos fichiers ici</p>}
    </div>
  );
}

DropZone.propTypes = {
  customStyles: PropTypes.object,
  onDrop: PropTypes.func.isRequired,
  uploading: PropTypes.bool.isRequired,
};
