import PropTypes from "prop-types";
import React from "react";
import { Controller } from "react-hook-form";
import { Alert, Text, Button } from "@mui/material";

import { ThemeSearch } from "./ThemeSearch";

function ThemePicker({ ...props }) {
  return (
    <Controller
      {...props}
      // eslint-disable-next-line no-unused-vars
      render={({ field }) => {
        if (field.value) {
          return (
            <Alert
              variant="success"
              sx={{
                minWidth: 0,
                p: "xxsmall",
                paddingRight: "medium",
                position: "relative",
              }}
            >
              <Text
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {field.value.title}
              </Text>
              <Button
                sx={{ position: "absolute", right: 0 }}
                onClick={() => {
                  field.onChange("");
                }}
              >
                <Text sx={{ fontSize: "xsmall" }}>Supprimer</Text>
              </Button>
            </Alert>
          );
        }
        return <ThemeSearch {...field} />;
      }}
    />
  );
}

ThemePicker.propTypes = {
  disabled: PropTypes.bool,
};

const MemoThemePicker = React.memo(ThemePicker);

export { MemoThemePicker as ThemePicker };
