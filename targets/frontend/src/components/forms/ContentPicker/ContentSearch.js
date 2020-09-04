/** @jsx jsx  */

import { getLabelBySource } from "@socialgouv/cdtn-sources";
import PropTypes from "prop-types";
import { useState } from "react";
import Autosuggest from "react-autosuggest";
import { Input, jsx } from "theme-ui";

import { getSuggestions } from "./searchService";

export const ContentSearch = ({ contents = [], onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const onSearchValueChange = (event, { newValue }) => {
    setSearchValue(newValue);
  };
  const onSuggestionSelected = (
    event,
    { suggestion: { cdtnId, slug, source, title, url = null } }
  ) => {
    if (contents.find((content) => content.cdtnId === cdtnId)) {
      return;
    }
    onChange(contents.concat([{ cdtnId, slug, source, title, url }]));
    setSearchValue("");
  };

  const onSuggestionsFetchRequested = async ({ value }) => {
    const hits = await getSuggestions(value);
    setSuggestions(
      hits.map(({ suggestions, ...section }) => {
        return {
          ...section,
          suggestions: suggestions.filter(
            (suggestion) =>
              !contents.find((content) => content.cdtnId === suggestion.cdtnId)
          ),
        };
      })
    );
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const inputProps = {
    onChange: onSearchValueChange,
    placeholder: "Rechercher et ajouter un contenu",
    value: searchValue,
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
    <div
      sx={{
        bg: "neutral",
        fontWeight: "bold",
        p: "xxsmall",
      }}
    >
      {section.title}
    </div>
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
