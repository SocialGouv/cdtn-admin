import PropTypes from "prop-types";
import React from "react";
import { Controller } from "react-hook-form";
import { Alert, Button } from "@mui/material";
import { theme as th } from "../../../theme";

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
                p: th.space.xxsmall,
                paddingRight: th.space.medium,
                position: "relative",
              }}
            >
              <p
                style={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {field.value.title}
              </p>
              <Button
                sx={{ position: "absolute", right: 0 }}
                onClick={() => {
                  field.onChange("");
                }}
              >
                <p sx={{ fontSize: "0.7rem" }}>Supprimer</p>
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
