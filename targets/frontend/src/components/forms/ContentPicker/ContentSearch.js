import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-utils";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDebouncedState } from "src/hooks/index";
import {
  Autocomplete,
  Box,
  ListSubheader,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "urql";
import { theme as th } from "../../../theme";

const sources = [
  SOURCES.SHEET_MT_PAGE,
  SOURCES.SHEET_SP,
  SOURCES.LETTERS,
  SOURCES.TOOLS,
  SOURCES.CONTRIBUTIONS,
  SOURCES.EXTERNALS,
  SOURCES.THEMATIC_FILES,
  SOURCES.EDITORIAL_CONTENT,
  SOURCES.CDT,
  SOURCES.THEMES,
];

const AUTOSUGGEST_MAX_RESULTS = 15;

const searchDocumentsQuery = `
query searchDocuments($sources: [String!]! = "", $search: String = "") {
  documents(
    where: {
      title: { _ilike: $search }
      source: { _in: $sources }
      _or: [
        { source: { _neq: "contributions" } }
        { source: { _eq: "contributions" }, document: { _contains: { idcc: "0000" } } }
      ]
    }
    limit: ${AUTOSUGGEST_MAX_RESULTS}
  ) {
    source
    title
    cdtnId: cdtn_id
    slug
    isAvailable: is_available
    isPublished: is_published
  }
}
`;

function getCategory(doc) {
  if (doc.source === SOURCES.THEMES) return "Thèmes";
  if (doc.source === SOURCES.CDT) return "Articles";
  return "Documents";
}

export const ContentSearch = ({ contents = [], onChange }) => {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, , setDebouncedSearchValue] = useDebouncedState("", 500);

  const [results] = useQuery({
    pause: searchValue.length < 3,
    query: searchDocumentsQuery,
    variables: {
      search: `%${searchValue}%`,
      sources,
    },
  });

  useEffect(() => {
    const allDocuments = results.data?.documents || [];
    const categorized = allDocuments.map((doc) => ({
      ...doc,
      category: getCategory(doc),
    }));
    setOptions(categorized);
  }, [results.data]);

  return (
    <Autocomplete
      options={options}
      groupBy={(option) => option.category}
      getOptionLabel={(option) => option.title || ""}
      inputValue={inputValue}
      onInputChange={(event, newValue) => {
        setInputValue(newValue);
        setDebouncedSearchValue(newValue);
      }}
      onChange={(event, value) => {
        if (!value) return;
        const { cdtnId, source, title, description, slug, isAvailable, isPublished } = value;
        if (contents.find((content) => content.cdtnId === cdtnId)) {
          return;
        }
        onChange(
          contents.concat([
            { cdtnId, description, slug, source, title, isAvailable, isPublished },
          ])
        );
        setInputValue("");
        setOptions([]);
      }}
      value={null}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Rechercher et ajouter un contenu"
          sx={{ width: "100%" }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.cdtnId}>
          {option.title}
          {option.category === "Documents" && (
            <strong> | {getLabelBySource(option.source)}</strong>
          )}
        </li>
      )}
      renderGroup={(params) => (
        <li key={params.key}>
          <ListSubheader
            sx={{
              backgroundColor: th.colors.neutral,
              fontWeight: "bold",
              padding: th.space.xxsmall,
            }}
          >
            {params.group}
          </ListSubheader>
          <ul style={{ padding: 0 }}>{params.children}</ul>
        </li>
      )}
      noOptionsText={
        inputValue.length < 3
          ? "Tapez au moins 3 caractères"
          : "Aucun résultat"
      }
      sx={{
        "& .MuiAutocomplete-listbox li": {
          cursor: "pointer",
          margin: 0,
          padding: th.space.xxsmall,
          "&:nth-of-type(2n + 1)": {
            backgroundColor: th.colors.highlight,
          },
          "&:hover": {
            backgroundColor: "#dde",
          },
        },
      }}
    />
  );
};

ContentSearch.propTypes = {
  contents: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};
