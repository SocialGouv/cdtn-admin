import { SOURCES } from "@socialgouv/cdtn-sources";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import { useDebouncedState } from "src/hooks/index";
import { Box, Input, Text } from "@mui/material";
import { useQuery } from "urql";

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
  const [suggestions, setSuggestions] = useState([]);
  const [inputSearchValue, setInputSearchValue] = useState("");
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
    setSuggestions(results.data?.documents || []);
  }, [results.data]);

  const onSearchValueChange = (event, { newValue }) => {
    setInputSearchValue(newValue);
  };

  const onSuggestionSelected = (
    event,
    { suggestion: { cdtnId, source, title = null, themeDocuments } }
  ) => {
    const position = themeDocuments.aggregate.count;
    onChange({ cdtnId, position, source, title });
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    setDebouncedSearchValue(value);
    setInputSearchValue(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const inputProps = {
    onChange: onSearchValueChange,
    placeholder: "Entrer le nom d'un thème et sélectionner le (ex: travail)",
    value: inputSearchValue,
  };
  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      getSuggestionValue={getSuggestionValue}
      shouldRenderSuggestions={shouldRenderSuggestions}
      renderInputComponent={renderInputComponent}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={renderSuggestionsContainer}
      inputProps={inputProps}
      alwaysRenderSuggestions
    />
  );
}

ThemeSearch.propTypes = {
  onChange: PropTypes.func.isRequired,
};

const renderInputComponent = (inputProps) => (
  <Input {...inputProps} sx={{ fontSize: "small", padding: "xxsmall" }} />
);

function shouldRenderSuggestions(value) {
  return value.trim().length >= 2;
}

const getSuggestionValue = (content) => content.title;

function renderSuggestion(content) {
  const parent = content.parentRelation[0]?.document?.title;
  const parentTitle = parent;
  return (
    <Box sx={{ lineHeight: 1.2 }}>
      <Text sx={{ color: "muted", fontSize: "small", fontWeight: "300" }}>
        {parentTitle}
      </Text>
      <Text sx={{ display: "block" }}>{content.title}</Text>
    </Box>
  );
}

function renderSuggestionsContainer({ containerProps, children }) {
  return (
    <Box
      {...containerProps}
      sx={{
        position: "relative",
      }}
    >
      <Box
        sx={{
          ".react-autosuggest__suggestion--highlighted": {
            bg: "info",
          },
          '[class*="container--open"] &': {
            border: "1px solid",
            borderColor: "neutral",
            borderRadius: "4px",
            boxShadow: "medium",
            left: 0,
            maxHeight: "300px",
            overflow: "scroll",
            position: "absolute",
            right: 0,
            top: "4px",
          },
          bg: "white",
          li: {
            ":nth-of-type(2n + 1):not(.react-autosuggest__suggestion--highlighted)":
              {
                bg: "highlight",
              },
            cursor: "pointer",
            m: "0",
            p: "xxsmall",
          },

          ul: {
            listStyleType: "none",
            m: "0",
            p: "0",
          },
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
