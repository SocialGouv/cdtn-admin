/** @jsxImportSource theme-ui */

import { useRouter } from "next/router";
import prettyBytes from "pretty-bytes";
import { useEffect, useRef, useState } from "react";
import {
  IoIosTrash,
  IoMdCloseCircleOutline,
  IoMdDownload,
} from "react-icons/io";
import { Button, IconButton } from "src/components/button";
import { CopyButton } from "src/components/button/CopyButton";
import { Layout } from "src/components/layout/auth.layout";
import { Li, List } from "src/components/list";
import { DropZone } from "src/components/storage/DropZone";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useDebouncedState } from "src/hooks/";
import { getToken } from "src/lib/auth/token";
import { timeSince } from "src/lib/duration";
import { request } from "src/lib/request";
import useSWR, { mutate } from "swr";
import {
  Box,
  Card,
  Field,
  Flex,
  Label,
  Message,
  Select,
  Spinner,
  Text,
} from "theme-ui";

const listFiles = (container) => () =>
  request(`/api/storage/${container}`, {
    headers: { token: getToken()?.jwt_token || "" },
  });
const uploadFiles = (container, formData) =>
  request(`/api/storage/${container}`, {
    body: formData,
    headers: { token: getToken()?.jwt_token || "" },
  });
const deleteFile = (container, path) =>
  request(`/api/storage/${container}/${path}`, {
    headers: { token: getToken()?.jwt_token || "" },
    method: "DELETE",
  });

const onDeleteClick = function (container, file) {
  const confirmed = confirm(
    `Êtes-vous sûr(e) de vouloir définitivement supprimer ${file.name} ?`
  );
  if (confirmed) {
    deleteFile(container, file.name)
      .then(() => {
        mutate("files");
      })
      .catch(() => {
        alert("Impossible de supprimer le fichier :/");
      });
  }
};

function FilesPage() {
  const router = useRouter();
  const container = router.query.container;
  const { data, error, isValidating } = useSWR("files", listFiles(container), {
    initialData: [],
  });
  const [search, setSearch, setDebouncedSearch] = useDebouncedState("", 400);
  const searchInputEl = useRef(null);
  const [isSearching, setSearching] = useState(false);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("mostRecent");
  const [displayedFiles, setDisplayedFiles] = useState([], 400);
  const [uploading, setUploading] = useState(false);
  const [currentClip, setCurrentClip] = useState("");

  // trigger refetch of files at first paint
  useEffect(() => {
    mutate("files");
  }, []);

  // Maybe we should limit displayed files to a number. Like 50 ?
  useEffect(() => {
    setDisplayedFiles(
      data
        .filter(
          (file) =>
            filterCallback(filter, file) &&
            (search
              ? file.name.toLowerCase().includes(search.toLowerCase().trim())
              : true)
        )
        .sort(getSortCallback(sort))
    );
  }, [data, sort, filter, search, setDisplayedFiles]);

  useEffect(() => {
    setSearching(false);
  }, [search]);

  if (error) {
    return (
      <Layout title="Fichiers">
        <Message variant="primary">erreur au chargement...</Message>
      </Layout>
    );
  }

  return (
    <Layout title={`Fichiers ${container} (${displayedFiles.length})`}>
      <DropZone
        customStyles={{ my: "medium" }}
        uploading={uploading}
        onDrop={(files) => {
          setUploading(true);
          uploadFiles(container, files).finally(() => {
            mutate("files");
            setUploading(false);
          });
        }}
      />
      <Flex as="form" my="medium">
        <Flex sx={{ alignItems: "flex-end" }}>
          <Field
            id="search"
            name="search"
            label="Rechercher un fichier"
            sx={{ maxWidth: "200px" }}
            ref={searchInputEl}
            onChange={(e) => {
              setDebouncedSearch(e.target.value);
              setSearching(true);
            }}
          />
          {search.length > 0 && (
            <IconButton
              type="button"
              sx={{ color: "text", mb: "0.6rem" }}
              onClick={() => {
                searchInputEl.current.value = "";
                setSearch("");
              }}
            >
              <IoMdCloseCircleOutline />
            </IconButton>
          )}
        </Flex>
        <Flex sx={{ flexDirection: "column", ml: "small" }}>
          <Label htmlFor="sort">Trier</Label>
          <Select
            id="sort"
            name="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="mostRecent">Plus récent</option>
            <option value="oldest">Plus vieux</option>
            <option value="alphabetic">Alphabétique</option>
            <option value="reverse-alphabetic">Alphabétique inversé</option>
            <option value="heaviest">Plus lourd</option>
            <option value="lightest">Plus léger</option>
          </Select>
        </Flex>
        <Flex sx={{ flexDirection: "column", ml: "small" }}>
          <Label htmlFor="filter">Filtrer par type</Label>
          <Select
            id="filter"
            name="filter"
            label="Filtrer par type"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="jpg">jpg</option>
            <option value="png">png</option>
            <option value="pdf">pdf</option>
            <option value="word">document word</option>
          </Select>
        </Flex>
      </Flex>
      {isSearching || isValidating ? (
        <Spinner />
      ) : displayedFiles.length > 0 ? (
        <>
          <List sx={{ listStyleType: "none", m: 0, p: 0 }}>
            {displayedFiles.map((file) => {
              return (
                <Li key={file.name}>
                  <Card
                    as="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={file.url}
                    key={file.name}
                    title={file.name}
                    sx={{
                      alignItems: "center",
                      color: "text",
                      display: "flex",
                      justifyContent: "space-between",
                      mt: "small",
                      textDecoration: "none",
                    }}
                  >
                    <IoMdDownload
                      sx={{ flex: "0 0 auto", mr: "small", ...iconSx }}
                    />
                    <Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
                      <Box
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </Box>
                      <Box sx={{ fontSize: "small" }}>
                        <Text sx={{ fontWeight: "bold" }}>Poids&nbsp;:</Text>{" "}
                        {prettyBytes(file.contentLength)} | Mise en ligne il y a{" "}
                        {timeSince(file.lastModified)}
                      </Box>
                    </Box>
                    <CopyButton
                      {...buttonProps}
                      variant="secondary"
                      text={file.name}
                      copied={currentClip === file.name}
                      onClip={(text) => {
                        setCurrentClip(text);
                      }}
                    />
                    <Button
                      {...buttonProps}
                      variant="primary"
                      onClick={(evt) => {
                        evt.preventDefault();
                        onDeleteClick(container, file);
                      }}
                    >
                      <IoIosTrash sx={iconSx} />
                      Supprimer
                    </Button>
                  </Card>
                </Li>
              );
            })}
          </List>
        </>
      ) : (
        <>Pas de résultats</>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(FilesPage));

const buttonProps = {
  outline: true,
  size: "small",
  sx: { flex: "0 0 auto", mx: "xxsmall" },
  type: "button",
};

const iconSx = {
  height: "iconSmall",
  mr: "xxsmall",
  width: "iconSmall",
};

const filterCallback = (filter, file) => {
  const extension = file.name.split(".").pop().toLowerCase();
  switch (filter) {
    case "jpg":
      return extension === "jpg" || extension === "jpeg";
    case "png":
      return extension === "png";
    case "pdf":
      return extension === "pdf";
    case "word":
      return extension === "doc" || extension === "docx";
    default:
      return true;
  }
};

const getSortCallback = (sort) => {
  switch (sort) {
    case "alphabetic":
      return (a, b) => a.name.localeCompare(b.name);
    case "reverse-alphabetic":
      return (a, b) => b.name.localeCompare(a.name);
    case "oldest":
      return (a, b) =>
        new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
    case "mostRecent":
      return (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    case "lightest":
      return (a, b) => a.contentLength - b.contentLength;
    case "heaviest":
      return (a, b) => b.contentLength - a.contentLength;
    default:
      return (a, b) => a.name.localeCompare(b.name);
  }
};
