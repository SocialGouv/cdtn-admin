/** @jsx jsx */

import { ErrorMessage } from "@hookform/error-message";
import PropTypes from "prop-types";
import { jsx } from "theme-ui";

export function FormErrorMessage({ errors, fieldName }) {
  return (
    <ErrorMessage
      errors={errors}
      name={fieldName}
      render={({ message }) => <div sx={{ color: "critical" }}>{message}</div>}
    />
  );
}

FormErrorMessage.propTypes = {
  errors: PropTypes.object,
  fieldName: PropTypes.string,
};
