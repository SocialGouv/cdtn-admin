/** @jsx jsx */

import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { mutate } from "swr";
import { jsx, Spinner } from "theme-ui";

const defaultStyles = {
  border: "2px dotted silver",
  borderRadius: "small",
  p: "medium",
};

export function DropZone({ onDrop: onDropCallback, customStyles }) {
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const formData = new FormData();
      for (const i in acceptedFiles) {
        if (acceptedFiles[i] instanceof File) {
          console.log(acceptedFiles[i].path);
          console.log(acceptedFiles[i]);
          formData.append(acceptedFiles[i].path, acceptedFiles[i]);
        }
      }
      onDropCallback(formData).finally(() => {
        setUploading(false);
        mutate("files");
      });
    },
    [onDropCallback]
  );

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept:
      "image/jpeg, image/png, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    onDrop,
  });

  if (isDragAccept) {
    defaultStyles.background = "#d1ffd9"; // some light green
  } else {
    delete defaultStyles.background;
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
};
