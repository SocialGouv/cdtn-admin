import PropTypes from "prop-types";
import React from "react";
import { Controller } from "react-hook-form";
import { Alert, Close, Text } from "theme-ui";

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
              variant="highlight"
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
              <Close
                sx={{ position: "absolute", right: 0 }}
                onClick={() => {
                  field.onChange("");
                }}
              />
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
