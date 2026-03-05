import { SOURCES } from "@socialgouv/cdtn-utils";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useDebouncedState } from "src/hooks/index";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { useQuery } from "urql";
import { theme as th } from "../../../theme";

const sources = [SOURCES.THEMES];

const AUTOSUGGEST_MAX_RESULTS = 15;

const searchThemesQuery = `
query searchThemes($sources: [String!]! = "", $search: String = "") {
  documents(where: {
    title: {_ilike: $search},
    source: {_in: $sources},
  }, limit: ${AUTOSUGGEST_MAX_RESULTS}) {
    source
    title
    cdtnId: cdtn_id
    themeDocuments: relation_a_aggregate(where: {type: {_eq: "theme-content"}}) {aggregate{count}}
    parentRelation: relation_b(where: {type: {_eq: "theme"}}) {
      document: a {
        title
      }
    }
  }
}
`;

export function ThemeSearch({ onChange }) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, , setDebouncedSearchValue] = useDebouncedState("", 500);

  const [results] = useQuery({
    pause: searchValue.length < 3,
    query: searchThemesQuery,
    variables: {
      search: `%${searchValue}%`,
      sources,
    },
  });

  useEffect(() => {
    setOptions(results.data?.documents || []);
  }, [results.data]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.title || ""}
      inputValue={inputValue}
      onInputChange={(event, newValue) => {
        setInputValue(newValue);
        setDebouncedSearchValue(newValue);
      }}
      onChange={(event, value) => {
        if (!value) return;
        const { cdtnId, source, title, themeDocuments } = value;
        const position = themeDocuments.aggregate.count;
        onChange({ cdtnId, position, source, title });
      }}
      value={null}
      filterOptions={(x) => x}
      open={inputValue.length >= 2}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Entrer le nom d'un thème et sélectionner le (ex: travail)"
          sx={{ padding: th.space.xxsmall, width: "100%" }}
        />
      )}
      renderOption={(props, option) => {
        const parent = option.parentRelation[0]?.document?.title;
        return (
          <li {...props} key={option.cdtnId}>
            <Box sx={{ lineHeight: 1.2 }}>
              <Typography variant="body2" color="text.secondary">
                {parent}
              </Typography>
              <Typography variant="body1" className="fr-text--bold">
                {option.title}
              </Typography>
            </Box>
          </li>
        );
      }}
      noOptionsText={
        inputValue.length < 2 ? "Tapez au moins 2 caractères" : "Aucun résultat"
      }
      slotProps={{
        listbox: {
          sx: {
            "& .MuiAutocomplete-option": {
              cursor: "pointer",
              margin: 0,
              padding: th.space.padding,
            },
            ".MuiAutocomplete-option[aria-selected='true']": {
              backgroundColor: th.colors.info,
            },
          },
        },
      }}
    />
  );
}

ThemeSearch.propTypes = {
  onChange: PropTypes.func.isRequired,
};
