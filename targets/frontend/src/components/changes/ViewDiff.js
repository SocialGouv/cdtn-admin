/** @jsxImportSource theme-ui */

import fastDiff from "fast-diff";
import PropTypes from "prop-types";

export const ViewDiff = ({ sx = {}, inputA, inputB }) => {
  const tokens = fastDiff(inputA, inputB);

  let result = "";
  for (const [operation, token] of tokens) {
    if (operation === 1) {
      result += <ins sx={{ bg: "positive" }}>{token}</ins>;
    } else if (operation === -1) {
      result += <del sx={{ bg: "critical" }}>{token}</del>;
    } else {
      result += token;
    }
  }

  return <div sx={{ mb: "large", ...sx }}>{result}</div>;
};

ViewDiff.defaultProps = {
  inputA: "",
  inputB: "",
};

ViewDiff.propTypes = {
  inputA: PropTypes.string,
  inputB: PropTypes.string,
  sx: PropTypes.object,
};
