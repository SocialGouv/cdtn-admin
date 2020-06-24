/** @jsx jsx */

import { jsx } from "theme-ui";
import PropTypes from "prop-types";
import { ErrorMessage } from "react-hook-form";

export function FormErrorMessage({ errors, fieldName }) {
  return (
    <ErrorMessage errors={errors} name={fieldName}>
      {({ message }) => <div sx={{ color: "critical" }}>{message}</div>}
    </ErrorMessage>
  );
}

FormErrorMessage.propTypes = {
  fieldName: PropTypes.string,
  errors: PropTypes.object,
};
