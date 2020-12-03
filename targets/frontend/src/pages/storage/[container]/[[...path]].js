import { formatDistanceToNow, parseISO } from "date-fns";
import frLocale from "date-fns/locale/fr";
import Link from "next/link";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import useSWR, { mutate } from "swr";

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;

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

const getUrl = (container, fileName) => {
  const CONTAINER_URL = `https://${ACCOUNT_NAME}.blob.core.windows.net/${container}`;
  return `${CONTAINER_URL}/${fileName}`;
};

function DropZone({ container }) {
  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    for (const i in acceptedFiles) {
      if (acceptedFiles[i] instanceof File) {
        formData.append(acceptedFiles[i].path, acceptedFiles[i]);
      }
    }
    uploadFiles(container, formData).then(() => mutate("files"));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      style={{ background: "#dedede", height: 200, width: "100%" }}
    >
      <input {...getInputProps()} />
      <p>Drop it</p>
    </div>
  );
}

const TimeSince = ({ date }) => (
  <span title={date}>
    {formatDistanceToNow(parseISO(date), { locale: frLocale })}
  </span>
);

function FileList({ container }) {
  const { data, error } = useSWR("files", listFiles(container));
  if (error) return <div>erreur...</div>;
  if (!data) return <div>chargement...</div>;
  const sortedFiles = data.sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <h4>{sortedFiles.length}</h4>
      {sortedFiles.map((file) => {
        return (
          <li key={file.name}>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={getUrl(file.name)}
            >
              {file.name}
            </Link>{" "}
            ({file.contentLength}) <TimeSince date={file.lastModified} />
          </li>
        );
      })}
    </div>
  );
}

export default function Files({ container }) {
  return (
    (container && (
      <React.Fragment>
        <h4>{container}</h4>
        <DropZone container={container} />
        <FileList container={container} />
      </React.Fragment>
    )) ||
    null
  );
}

export function getStaticProps({ params }) {
  const { container } = params;
  return {
    props: { container },
  };
}

export async function getStaticPaths() {
  return {
    fallback: true,
    paths: [],
  };
}
