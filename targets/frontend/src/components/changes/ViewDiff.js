/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import { useState } from "react";

var jsdiff = require("diff");

// adapted from https://github.com/davidmason/react-stylable-diff/blob/master/lib/react-diff.js

const fnMap = {
  chars: jsdiff.diffChars,
  json: jsdiff.diffJson,
  sentences: jsdiff.diffSentences,
  words: jsdiff.diffWords,
};

export const ViewDiff = ({ sx, type, inputA, inputB }) => {
  const isSentencesForced = !inputA || !inputB;
  const [mode, setMode] = useState(isSentencesForced ? "sentences" : type);
  const diff = fnMap[mode](inputA, inputB);

  const groupName = Math.random();

  const result = diff.map((part, index) => {
    if (part.added) {
      return (
        <ins sx={{ bg: "positive" }} key={index}>
          {part.value}
        </ins>
      );
    }
    if (part.removed) {
      return (
        <del sx={{ bg: "critical" }} key={index}>
          {part.value}
        </del>
      );
    }
    return <span key={index}>{part.value}</span>;
  });
  return (
    <div sx={{ mb: "large", ...sx }}>
      <div sx={{ marginBottom: 20 }}>
        Diff mode :
        <input
          type="radio"
          name={groupName}
          onChange={() => setMode("words")}
          style={{ marginLeft: 10 }}
          checked={mode === "words"}
          disabled={isSentencesForced}
        />{" "}
        Mots
        <input
          type="radio"
          name={groupName}
          onChange={() => setMode("sentences")}
          style={{ marginLeft: 10 }}
          checked={mode === "sentences"}
          disabled={isSentencesForced}
        />{" "}
        Phrases
      </div>
      {result}
    </div>
  );
};

ViewDiff.defaultProps = {
  inputA: "",
  inputB: "",
  sx: {},
  type: "chars",
};

ViewDiff.propTypes = {
  inputA: PropTypes.string,
  inputB: PropTypes.string,
  sx: PropTypes.object,
  type: PropTypes.string,
};
