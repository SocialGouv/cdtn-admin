/** jsxImportSource theme-ui */
import PropTypes from "prop-types";
import { useRef } from "react";
import { Controller } from "react-hook-form";
import { Button } from "src/components/button";
import { Flex, Input } from "theme-ui";

import { List } from "./List";

const Lister = ({ defaultValue = "[]", disabled, ...props }) => {
  return (
    <Controller
      {...props}
      defaultValue={defaultValue}
      render={(props) => <RootLister disabled={disabled} {...props} />}
    />
  );
};

Lister.propTypes = {
  defaultValue: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
};

export { Lister };

function RootLister({ disabled, value: entries, onChange, name }) {
  const inputRef = useRef(null);
  const onAddEntry = () => {
    const value = inputRef.current.value;
    if (value === "") return;
    if (!entries.includes(value)) {
      onChange([...entries, value.trim()]);
    }
    inputRef.current.value = "";
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
      {!disabled && (
        <Flex>
          <Input
            sx={{ p: "xxsmall" }}
            id={name}
            name={name}
            ref={inputRef}
            onKeyDown={handleKeyDown}
          />
          <Button
            size="small"
            onClick={onAddEntry}
            variant="secondary"
            type="button"
            sx={{ flex: "1 0 auto", ml: "xxsmall" }}
          >
            Ajouter
          </Button>
        </Flex>
      )}
      {entries.length > 0 && (
        <List
          entries={entries}
          disabled={disabled}
          useDragHandle={true}
          lockAxis="y"
          onDeleteEntry={onDeleteEntry}
        />
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
