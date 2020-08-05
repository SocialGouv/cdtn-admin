// adapted from https://github.com/davidmason/react-stylable-diff/blob/master/lib/react-diff.js
/** @jsx jsx */

import PropTypes from "prop-types";
import { useState } from "react";
import { jsx } from "theme-ui";

var jsdiff = require("diff");

const fnMap = {
  chars: jsdiff.diffChars,
  json: jsdiff.diffJson,
  sentences: jsdiff.diffSentences,
  words: jsdiff.diffWords,
};

export const ViewDiff = ({ sx, type, inputA, inputB }) => {
  const [mode, setMode] = useState(type);
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
    <div sx={sx}>
      <div sx={{ marginBottom: 20 }}>
        Diff mode :
        <input
          type="radio"
          name={groupName}
          onClick={() => setMode("words")}
          style={{ marginLeft: 10 }}
          checked={mode === "words"}
        />{" "}
        Mots
        <input
          type="radio"
          name={groupName}
          onClick={() => setMode("sentences")}
          style={{ marginLeft: 10 }}
          checked={mode === "sentences"}
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
