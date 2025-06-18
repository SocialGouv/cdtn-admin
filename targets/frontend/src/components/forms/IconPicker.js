import { icons } from "@socialgouv/cdtn-ui";
import PropTypes from "prop-types";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { IoMdCloseCircle } from "react-icons/io";
import { IconButton } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Card } from "@mui/material";
import { theme as th } from "../../theme";

const IconPicker = ({ defaultValue = null, disabled, ...props }) => {
  return (
    <Controller
      {...props}
      defaultValue={defaultValue}
      render={({ field }) => <RootIconPicker disabled={disabled} {...field} />}
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
            const CardIcon = icons[key];
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
                style={generateIconCardStyles()}
              >
                <CardIcon
                  style={{
                    ...iconBaseStyle,
                  }}
                />
              </Card>
            );
          })}
        </div>
      </Dialog>
      <div style={{ display: "inline-block", position: "relative" }}>
        <Card
          as="button"
          type="button"
          sx={generateIconCardStyles(disabled)}
          onClick={() => !disabled && setShowIconList(true)}
        >
          {Icon ? <Icon style={iconBaseStyle} /> : <NoIcon />}
        </Card>
        {value && !disabled && (
          <IconButton
            type="button"
            onClick={() => {
              onChange(null);
            }}
            style={{
              bg: "white",
              height: th.sizes.iconMedium,
              marginLeft: th.space.xsmall,
              position: "absolute",
              right: "-0.5rem",
              top: "-0.5rem",
              width: th.sizes.iconMedium,
            }}
          >
            <IoMdCloseCircle
              sx={{
                height: th.sizes.iconSmall,
                width: th.sizes.iconSmall,
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
  display: "inline-flex",
  flexShrink: 0,
  fontSize: "1rem",
  margin: th.space.xxsmall,
  padding: "1.1rem",
  position: "relative",
  ...(!disabled && {
    ":hover": { boxShadow: "cardHover" },
    cursor: "pointer",
  }),
});

const NoIcon = () => <div>Pas d’icône</div>;
