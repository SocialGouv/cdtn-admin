/** @jsx jsx */

import { useRouter } from "next/router";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import {
  IoIosTrash,
  IoMdCheckmark,
  IoMdClipboard,
  IoMdCloseCircleOutline,
  IoMdDownload,
} from "react-icons/io";
import { Button, IconButton } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { DropZone } from "src/components/storage/DropZone";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useDebouncedState } from "src/hooks/";
import { deleteFile, listFiles, uploadFiles } from "src/lib/azure";
import { timeSince } from "src/lib/duration";
import useSWR, { mutate } from "swr";
import {
  Card,
  Field,
  Flex,
  jsx,
  Label,
  Message,
  Select,
  Spinner,
} from "theme-ui";

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
  const { data = [], error } = useSWR("files", listFiles(container));

  const [hasClipboardApi, setHasClipboardApi] = useState(false);
  const [currentClip, setCurrentClip] = useState("");
  const [isSearching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("mostRecent");
  const [filter, setFilter] = useState("");
  const [
    displayedFiles,
    setDisplayedFiles,
    setDebouncedDisplayedFiles,
  ] = useDebouncedState([], 400);

  // Maybe we should limit displayed files to a number. Like 50 ?
  useEffect(() => {
    // prevent loader at first display of page
    if (!displayedFiles.length && !search)
      return setDisplayedFiles(
        data.filter(filterCallback(filter)).sort(getSortCallback(sort))
      );
    setSearching(true);
    setDebouncedDisplayedFiles(
      data
        .filter((file) =>
          file.name.toLowerCase().includes(search.toLowerCase().trim())
        )
        .filter(filterCallback(filter))
        .sort(getSortCallback(sort))
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data,
    sort,
    filter,
    search,
    setDisplayedFiles,
    setDebouncedDisplayedFiles,
  ]);

  useEffect(() => {
    setSearching(false);
  }, [displayedFiles]);

  useEffect(() => {
    setHasClipboardApi(Boolean(navigator?.clipboard));
  }, [setHasClipboardApi]);

  useEffect(() => {
    if (!currentClip) return;
    const timeout = window.setTimeout(() => {
      setCurrentClip("");
    }, 5000);
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [currentClip, setCurrentClip]);

  function copyToClipboard(data) {
    navigator.clipboard.writeText(data);
    setCurrentClip(data);
  }
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
        onDrop={(files) => uploadFiles(container, files)}
      />
      <form
        sx={{
          display: "flex",
          my: "medium",
        }}
      >
        <Flex sx={{ alignItems: "flex-end" }}>
          <Field
            id="search"
            name="search"
            label="Rechercher un fichier"
            sx={{ maxWidth: "200px" }}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            value={search}
          />
          {search.length > 0 && (
            <IconButton
              type="button"
              sx={{ color: "text", mb: "0.6rem" }}
              onClick={() => {
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
      </form>
      {isSearching || !data ? (
        <Spinner />
      ) : (
        <ul sx={{ listStyleType: "none", m: 0, p: 0 }}>
          {displayedFiles.map((file) => {
            return (
              <li key={file.name}>
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
                  <div sx={{ flex: "1 1 auto", minWidth: 0 }}>
                    <div
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </div>
                    <div sx={{ fontSize: "small" }}>
                      <span sx={{ fontWeight: "bold" }}>Poids&nbsp;:</span>{" "}
                      {prettyBytes(file.contentLength)} | Mise en ligne il y a{" "}
                      {timeSince(file.lastModified)}
                    </div>
                  </div>
                  {hasClipboardApi && (
                    <Button
                      {...buttonProps}
                      variant="secondary"
                      {...(currentClip === file.name && { disabled: true })}
                      onClick={(evt) => {
                        evt.preventDefault();
                        copyToClipboard(file.name);
                      }}
                    >
                      {currentClip === file.name ? (
                        <>
                          <IoMdCheckmark sx={iconSx} /> Copié !
                        </>
                      ) : (
                        <>
                          <IoMdClipboard sx={iconSx} />
                          Copier le lien
                        </>
                      )}
                    </Button>
                  )}
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
              </li>
            );
          })}
        </ul>
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

const filterCallback = (filter) => (file) => {
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
