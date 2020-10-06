/** @jsx jsx  */

import { icons } from "@socialgouv/react-ui";
import PropTypes from "prop-types";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { IoMdCloseCircle } from "react-icons/io";
import { IconButton } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Card, jsx } from "theme-ui";

const IconPicker = ({ defaultValue = null, disabled, ...props }) => {
  return (
    <Controller
      {...props}
      defaultValue={defaultValue}
      render={(props) => <RootIconPicker disabled={disabled} {...props} />}
    />
  );
};

IconPicker.propTypes = {
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
};

export { IconPicker };

function RootIconPicker({ disabled, value, onChange }) {
  const [showIconList, setShowIconList] = useState(false);
  const Icon = icons[value];
  return (
    <>
      <Dialog
        isOpen={showIconList}
        onDismiss={() => setShowIconList(false)}
        aria-label="Voir toutes les icones"
      >
        <div>
          {Object.keys(icons).map((key) => {
            const Icon = icons[key];
            return (
              <Card
                as="button"
                type="button"
                onClick={() => {
                  setShowIconList(false);
                  onChange(key);
                }}
                key={key}
                title={key}
                sx={generateIconCardStyles()}
              >
                <Icon
                  sx={{
                    ...iconBaseStyle,
                  }}
                />
              </Card>
            );
          })}
        </div>
      </Dialog>
      <div sx={{ display: "inline-block", position: "relative" }}>
        <Card
          as="button"
          type="button"
          sx={generateIconCardStyles(disabled)}
          onClick={() => !disabled && setShowIconList(true)}
        >
          {Icon ? <Icon sx={iconBaseStyle} /> : <NoIcon />}
        </Card>
        {value && !disabled && (
          <IconButton
            type="button"
            onClick={() => {
              onChange(null);
            }}
            sx={{
              bg: "white",
              height: "2rem",
              ml: "xsmall",
              position: "absolute",
              right: "-0.5rem",
              top: "-0.5rem",
              width: "2rem",
            }}
          >
            <IoMdCloseCircle
              sx={{
                height: "1.5rem",
                width: "1.5rem",
              }}
            />
          </IconButton>
        )}
      </div>
    </>
  );
}

RootIconPicker.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

const iconBaseStyle = {
  height: "3rem",
  width: "3rem",
};

const generateIconCardStyles = (disabled = false) => ({
  background: "transparent",
  border: "none",
  color: "text",
  display: "inline-flex",
  flexShrink: 0,
  fontFamily: "Muli",
  fontSize: "1rem",
  m: "xxsmall",
  padding: "1.1rem",
  position: "relative",
  ...(!disabled && {
    ":hover": { boxShadow: "cardHover" },
    cursor: "pointer",
  }),
});

const NoIcon = () => <div>Pas d’icône</div>;
