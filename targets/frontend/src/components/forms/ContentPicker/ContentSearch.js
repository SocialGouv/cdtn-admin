/** @jsxImportSource theme-ui */

import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import { useDebouncedState } from "src/hooks/index";
import { Box, Input } from "theme-ui";
import { useQuery } from "urql";

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
  documents(where: {title: {_ilike: $search}, source: {_in: $sources}, _not: {document: {_has_key: "split"}}}, limit: ${AUTOSUGGEST_MAX_RESULTS}) {
    source
    title
    cdtnId: cdtn_id
  }
}
`;

export const ContentSearch = ({ contents = [], onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputSearchValue, setInputSearchValue] = useState("");
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
    const documents = allDocuments.filter(
      (document) =>
        document.source !== SOURCES.THEMES && document.source !== SOURCES.CDT
    );
    documents.forEach((document) => {
      document.category = "document";
    });
    const themes = allDocuments.filter(
      (document) => document.source === SOURCES.THEMES
    );
    const articles = allDocuments.filter(
      (document) => document.source === SOURCES.CDT
    );
    setSuggestions([
      {
        suggestions: documents,
        title: "Documents",
      },
      { suggestions: articles, title: "Articles" },
      { suggestions: themes, title: "Thèmes" },
    ]);
  }, [results.data]);

  const onSearchValueChange = (event, { newValue }) => {
    setInputSearchValue(newValue);
    setDebouncedSearchValue(newValue);
  };
  const onSuggestionSelected = (
    event,
    { suggestion: { cdtnId, source, title = null } }
  ) => {
    if (contents.find((content) => content.cdtnId === cdtnId)) {
      return;
    }
    onChange(contents.concat([{ cdtnId, source, title }]));
    setInputSearchValue("");
    setSuggestions([]);
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    setInputSearchValue(value);
    setDebouncedSearchValue(value);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const inputProps = {
    onChange: onSearchValueChange,
    placeholder: "Rechercher et ajouter un contenu",
    value: inputSearchValue,
  };

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionSelected={onSuggestionSelected}
      getSuggestionValue={getSuggestionValue}
      getSectionSuggestions={getSectionSuggestions}
      multiSection={true}
      shouldRenderSuggestions={shouldRenderSuggestions}
      renderInputComponent={renderInputComponent}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={renderSuggestionsContainer}
      renderSectionTitle={renderSectionTitle}
      inputProps={inputProps}
    />
  );
};

ContentSearch.propTypes = {
  contents: PropTypes.array,
  onChange: PropTypes.func.isRequired,
};

const renderInputComponent = (inputProps) => (
  <Input {...inputProps} ref={inputProps.ref} />
);

function shouldRenderSuggestions(value) {
  return value.trim().length > 2;
}
function renderSectionTitle(section) {
  return section.suggestions.length ? (
    <Box bg="neutral" fontWeight="bold" p="xxsmall">
      {section.title}
    </Box>
  ) : null;
}

function getSectionSuggestions(section) {
  return section.suggestions;
}

const getSuggestionValue = (content) => content.title;

const renderSuggestion = (content) => (
  <div>
    {content.title}
    {content.category === "document" && (
      <strong> | {getLabelBySource(content.source)}</strong>
    )}
  </div>
);

const renderSuggestionsContainer = ({ containerProps, children }) => (
  <div
    sx={{
      '&[class*="container--open"]': {
        border: "1px solid #ddd",
        borderRadius: "4px",
        maxHeight: "300px",
        overflow: "scroll",
        position: "relative",
        top: "4px",
      },
      li: {
        '&[role="option"]:hover': {
          bg: "#dde",
        },
        ":nth-of-type(2n + 1)": {
          bg: "highlight",
        },
        bg: "white",
        cursor: "pointer",
        m: "0",
        p: "xxsmall",
        zIndex: 2,
      },
      ul: {
        listStyleType: "none",
        m: "0",
        p: "0",
        width: "100%",
      },
    }}
    {...containerProps}
  >
    {children}
  </div>
);
