import { ErrorMessage } from "@hookform/error-message";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

export function FormErrorMessage({ errors = {}, fieldName }) {
  return (
    <ErrorMessage
      errors={errors}
      name={fieldName}
      render={({ message }) => <Box sx={{ color: "critical" }}>{message}</Box>}
    />
  );
}

FormErrorMessage.propTypes = {
  errors: PropTypes.object,
  fieldName: PropTypes.string,
};
