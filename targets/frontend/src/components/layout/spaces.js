import PropTypes from "prop-types";

import { theme } from "../../theme";

const spaces = Object.keys(theme.space);

export const spacePropTypes = PropTypes.oneOfType([
  PropTypes.oneOf(spaces),
  PropTypes.arrayOf(PropTypes.oneOf(spaces)),
]);

export function invertSpace(scaleOrValue) {
  if (Array.isArray(scaleOrValue)) {
    return invertScale(scaleOrValue);
  }
  return invertValue(scaleOrValue);
}

function invertScale(scale) {
  return scale.map(invertValue);
}

function invertValue(value) {
  const themeValue = theme.space[value];
  if (Object.prototype.toString.call(themeValue) === "[object String]") {
    return `calc(${themeValue} * -1)`;
  }
  if (Object.prototype.toString.call(themeValue) === "[object Number]") {
    return themeValue * -1;
  }
  throw new Error(
    "invertValue unsupported type " + Object.prototype.toString.call(themeValue)
  );
}
