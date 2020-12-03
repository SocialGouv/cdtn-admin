import { formatDistanceToNow, parseISO } from "date-fns";
import frLocale from "date-fns/locale/fr";
import Link from "next/link";
import prettyBytes from "pretty-bytes";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import useSWR, { mutate } from "swr";
import { Message, Spinner } from "theme-ui";

const uploadFiles = (container, formData) => {
  return fetch(`/api/storage/${container}`, {
    body: formData,
    credentials: "include",
    method: "POST",
  }).then((res) => res.json());
};

const listFiles = (container) => () => {
  return fetch(`/api/storage/${container}`, {
    credentials: "include",
    method: "GET",
  }).then((res) => res.json());
};

function DropZone({ container, children }) {
  const [uploading, setUploading] = useState(false);
  const onDrop = useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      const formData = new FormData();
      for (const i in acceptedFiles) {
        if (acceptedFiles[i] instanceof File) {
          formData.append(acceptedFiles[i].path, acceptedFiles[i]);
        }
      }
      uploadFiles(container, formData)
        .then(() => {
          setUploading(false);
          mutate("files");
        })
        .catch(() => {
          setUploading(false);
          mutate("files");
        });
    },
    [container]
  );

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept:
      "image/jpeg, image/png, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    onDrop,
  });

  const style = {
    border: "2px dotted silver",
    borderRadius: 3,
    padding: 5,
    width: "100%",
  };

  if (isDragAccept) {
    style.background = "#d1ffd9"; // some light green
  }
  return (
    <div {...getRootProps()} style={style}>
      <input {...getInputProps()} />
      {uploading ? <Spinner /> : <p>Glissez vos fichiers ici</p>}
      {children}
    </div>
  );
}

const TimeSince = ({ date }) => (
  <span title={date}>
    {formatDistanceToNow(parseISO(date), { locale: frLocale })}
  </span>
);

function FileList({ files }) {
  return (
    <div>
      {files.map((file) => {
        return (
          <li key={file.name}>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={file.url}
              passHref
            >
              {file.name}
            </Link>{" "}
            ({prettyBytes(file.contentLength)}){" "}
            <TimeSince date={file.lastModified} />
          </li>
        );
      })}
    </div>
  );
}

function FilesPage(props) {
  const container = props.query.container;
  const { data, error } = useSWR("files", listFiles(container));
  if (error)
    return <Message variant="primary">erreur au chargement...</Message>;
  if (!data) return <Spinner />;
  const sortedFiles = data.sort((a, b) => a.name.localeCompare(b.name));
  return (
    (container && (
      <Layout title={`Fichiers ${container} (${sortedFiles.length})`}>
        <DropZone container={container} />
        <FileList files={sortedFiles} />
      </Layout>
    )) ||
    null
  );
}

FilesPage.getInitialProps = function getInitialProps({ query }) {
  return {
    query,
  };
};

export default withCustomUrqlClient(withUserProvider(FilesPage));
