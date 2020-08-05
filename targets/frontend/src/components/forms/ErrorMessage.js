/** @jsx jsx */

import PropTypes from "prop-types";
import { ErrorMessage } from "react-hook-form";
import { jsx } from "theme-ui";

export function FormErrorMessage({ errors, fieldName }) {
  return (
    <ErrorMessage errors={errors} name={fieldName}>
      {({ message }) => <div sx={{ color: "critical" }}>{message}</div>}
    </ErrorMessage>
  );
}

FormErrorMessage.propTypes = {
  errors: PropTypes.object,
  fieldName: PropTypes.string,
};
