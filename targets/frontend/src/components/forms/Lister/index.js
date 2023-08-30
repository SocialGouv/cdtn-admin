import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { Button } from "src/components/button";
import { TextField, Box } from "@mui/material";

import { List } from "./List";
import { theme } from "src/theme";

const Lister = ({ defaultValue = [], disabled, ...props }) => {
  return (
    <Controller
      {...props}
      defaultValue={defaultValue}
      // eslint-disable-next-line no-unused-vars
      render={({ field }) => <RootLister disabled={disabled} {...field} />}
    />
  );
};

Lister.propTypes = {
  defaultValue: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
};

export { Lister };

function RootLister({ disabled, value: entries, onChange, name }) {
  const [entry, setEntry] = useState("");
  const onAddEntry = () => {
    if (entry === "") return;
    if (!entries.includes(entry)) {
      onChange([...entries, entry.trim()]);
    }
    setEntry("");
  };
  const onDeleteEntry = (deletedEntry) => {
    const entriesCopy = [...entries];
    entriesCopy.splice(entriesCopy.indexOf(deletedEntry), 1);
    onChange(entriesCopy);
  };

  const handleKeyDown = (event) => {
    // 13 is the keyCode for "enter"
    if (event.keyCode === 13) {
      event.preventDefault();
      onAddEntry();
    }
  };

  return (
    <>
      {entries.length > 0 && (
        <List
          entries={entries}
          disabled={disabled}
          useDragHandle={true}
          lockAxis="y"
          onDeleteEntry={onDeleteEntry}
        />
      )}
      {!disabled && (
        <Box sx={{ display: "flex" }}>
          <TextField
            padding={theme.space.xxsmall}
            id={name}
            name={name}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
            }}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <Button
            size="small"
            onClick={onAddEntry}
            variant="secondary"
            type="button"
            sx={{ flex: "1 0 auto", ml: theme.space.xxsmall }}
          >
            Ajouter
          </Button>
        </Box>
      )}
    </>
  );
}

RootLister.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.arrayOf(PropTypes.string),
};
