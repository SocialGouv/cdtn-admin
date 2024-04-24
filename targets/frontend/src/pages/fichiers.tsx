import { Button, IconButton, ListItem } from "@mui/material";
import prettyBytes from "pretty-bytes";
import { useEffect, useRef, useState } from "react";
import {
  IoIosTrash,
  IoMdCloseCircleOutline,
  IoMdDownload,
} from "react-icons/io";
import { CopyButton } from "src/components/button/CopyButton";
import { Layout } from "src/components/layout/auth.layout";
import { DropZone } from "src/components/storage/DropZone";
import { useDebouncedState } from "src/hooks/";
import { timeSince } from "src/lib/duration";
import { request } from "src/lib/request";
import useSWR, { mutate } from "swr";
import { theme } from "../theme";
import {
  Box,
  Card,
  TextField as Field,
  InputLabel as Label,
  Alert,
  Select,
  CircularProgress as Spinner,
  MenuItem,
  List,
} from "@mui/material";
import { S3File } from "src/lib/upload";
function FilesPage() {
  const { data, error, isValidating, mutate } = useSWR<S3File[]>("files", () =>
    request(`/api/storage`)
  );
  const [search, setSearch, setDebouncedSearch] = useDebouncedState("", 400);
  const searchInputEl = useRef<any>(null);
  const [isSearching, setSearching] = useState(false);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("mostRecent");
  const [uploading, setUploading] = useState(false);
  const [currentClip, setCurrentClip] = useState("");

  const onDeleteClick = async function (file: S3File) {
    const confirmed = confirm(
      `Êtes-vous sûr(e) de vouloir définitivement supprimer ${file.key} ?`
    );
    if (confirmed) {
      try {
        await request(`/api/storage/${file.key}`, {
          method: "DELETE",
        });
        mutate();
      } catch (e) {
        console.error(e);
        alert("Impossible de supprimer le fichier :/");
      }
    }
  };

  const onUploadClick = function (files: FormData) {
    setUploading(true);
    request(`/api/storage`, {
      body: files,
    })
      .then(() => {
        // wait 3 seconds to let the file be uploaded
        setTimeout(() => {
          mutate();
        }, 3000);
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        alert(
          "Impossible de supprimer le fichier :/, le message d'erreur est : " +
            JSON.stringify(err.data.errorMessage)
        );
      })
      .finally(() => {
        setUploading(false);
      });
  };

  useEffect(() => {
    setSearching(false);
  }, [search]);

  if (error) {
    return (
      <Layout title="Fichiers">
        <Alert severity="error">erreur au chargement...</Alert>
      </Layout>
    );
  }

  return (
    <Layout title={`Fichiers  (${data?.length})`}>
      <DropZone
        customStyles={{
          marginBottom: theme.space.medium,
          marginTop: theme.space.medium,
        }}
        uploading={uploading}
        onDrop={onUploadClick}
      />
      <Box sx={{ display: "flex" }} component="form" my="medium">
        <Box
          sx={{ display: "flex", alignItems: "flex-end", position: "relative" }}
        >
          <Field
            id="search"
            name="search"
            label="Rechercher un fichier"
            sx={{ maxWidth: "250px", paddingRight: theme.space.large }}
            ref={searchInputEl}
            onChange={(e) => {
              setDebouncedSearch(e.target.value);
              setSearching(true);
            }}
          />
          {search.length > 0 && (
            <IconButton
              style={{
                color: "text",
                marginBottom: "0.6rem",
                position: "absolute",
                right: "-10px",
              }}
              onClick={() => {
                searchInputEl.current.value = "";
                setSearch("");
              }}
            >
              <IoMdCloseCircleOutline />
            </IconButton>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            ml: theme.space.medium,
          }}
        >
          <Label htmlFor="sort">Trier</Label>
          <Select
            id="sort"
            name="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <MenuItem value="mostRecent">Plus récent</MenuItem>
            <MenuItem value="oldest">Plus vieux</MenuItem>
            <MenuItem value="alphabetic">Alphabétique</MenuItem>
            <MenuItem value="reverse-alphabetic">Alphabétique inversé</MenuItem>
            <MenuItem value="heaviest">Plus lourd</MenuItem>
            <MenuItem value="lightest">Plus léger</MenuItem>
          </Select>
        </Box>
        <Box sx={{ flexDirection: "column", ml: theme.space.medium }}>
          <Label htmlFor="filter">Filtrer par type</Label>
          <Select
            id="filter"
            name="filter"
            label="Filtrer par type"
            value={filter || "tous"}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="tous">Tous</MenuItem>
            <MenuItem value="jpg">jpg</MenuItem>
            <MenuItem value="svg">svg</MenuItem>
            <MenuItem value="png">png</MenuItem>
            <MenuItem value="pdf">pdf</MenuItem>
            <MenuItem value="word">document word</MenuItem>
          </Select>
        </Box>
      </Box>
      {isSearching || (isValidating && !data) ? (
        <Spinner />
      ) : data && data?.length > 0 ? (
        <>
          <List sx={{ listStyleType: "none", m: 0, p: 0 }}>
            {data
              .filter(
                (file) =>
                  filterCallback(filter, file) &&
                  (search
                    ? file.key
                        .toLowerCase()
                        .includes(search.toLowerCase().trim())
                    : true)
              )
              .sort(getSortCallback(sort))
              .map((file) => {
                return (
                  <ListItem
                    key={file.key}
                    style={{
                      width: "100%",
                    }}
                  >
                    <Card
                      component="a"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={file.url}
                      key={file.key}
                      title={file.key}
                      sx={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        mt: theme.space.small,
                        textDecoration: "none",
                        width: "100%",
                        padding: "20px",
                      }}
                    >
                      <IoMdDownload
                        style={{
                          flex: "0 0 auto",
                          ...iconSx,
                        }}
                      />
                      <Box
                        sx={{
                          marginLeft: theme.space.medium,
                          flex: "1 1 auto",
                          minWidth: 0,
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {file.key}
                        </Box>
                        <Box>
                          Poids :{" "}
                          <span style={{ fontWeight: "bold" }}>
                            {prettyBytes(file.size)}
                          </span>{" "}
                          | Mise en ligne il y a{" "}
                          <span style={{ fontWeight: "bold" }}>
                            {timeSince(file.lastModified.toString())}
                          </span>
                        </Box>
                      </Box>
                      <CopyButton
                        {...buttonProps}
                        variant="secondary"
                        text={file.key}
                        copied={currentClip === file.key}
                        onClip={(text: any) => {
                          setCurrentClip(text);
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={(evt) => {
                          evt.preventDefault();
                          onDeleteClick(file);
                        }}
                        sx={{ flex: "0 0 auto", mx: theme.space.xsmall }}
                      >
                        <IoIosTrash style={iconSx} />
                        Supprimer
                      </Button>
                    </Card>
                  </ListItem>
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

export default FilesPage;

const buttonProps = {
  outline: true,
  size: theme.space.small,
  sx: { flex: "0 0 auto", mx: theme.space.xsmall },
  type: "button",
};

const iconSx = {
  height: theme.sizes.iconSmall,
  marginRight: theme.space.xxsmall,
  width: theme.sizes.iconSmall,
};

const filterCallback = (filter: any, file: S3File) => {
  const extension = file.key.toLowerCase();
  switch (filter) {
    case "jpg":
      return extension === "jpg" || extension === "jpeg";
    case "png":
      return extension === "png";
    case "pdf":
      return extension === "pdf";
    case "svg":
      return extension === "svg";
    case "word":
      return extension === "doc" || extension === "docx";
    default:
      return true;
  }
};

const getSortCallback = (sort: any) => {
  switch (sort) {
    case "alphabetic":
      return (a: S3File, b: S3File) => a.key.localeCompare(b.key);
    case "reverse-alphabetic":
      return (a: S3File, b: S3File) => b.key.localeCompare(a.key);
    case "oldest":
      return (a: S3File, b: S3File) =>
        new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
    case "mostRecent":
      return (a: S3File, b: S3File) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    case "lightest":
      return (a: S3File, b: S3File) => a.size - b.size;
    case "heaviest":
      return (a: S3File, b: S3File) => b.size - a.size;
    default:
      return (a: S3File, b: S3File) => a.key.localeCompare(b.key);
  }
};
