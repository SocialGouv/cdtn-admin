/** @jsx jsx */
import React from "react";
import { jsx, Button as BaseButton } from "theme-ui";
import PropTypes from "prop-types";

const buttonPropTypes = {
  variant: PropTypes.oneOf(["secondary", "primary"]),
  size: PropTypes.oneOf(["small", "normal"]),
};

const defaultButtonStyles = {
  cursor: "pointer",
  appearance: "none",
  display: "inline-block",
  textAlign: "center",
  lineHeight: "inherit",
  textDecoration: "none",
  fontSize: "inherit",
  fontWeight: "bold",
  m: 0,
  borderRadius: "small",
  borderWidth: 2,
  borderStyle: "solid",
};
const normalSize = {
  px: "xsmall",
  py: "xsmall",
};
const smallSize = {
  px: "xxsmall",
  py: "xxsmall",
};

// function _Button({ outline = false, ...props }) {}

export const Button = React.forwardRef(({ outline, ...props }, ref) => (
  <div ref={ref}>
    {outline ? (
      <OutlineButton {...props} />
    ) : (
      <SolidButton ref={ref} {...props} />
    )}
  </div>
));
Button.propTypes = {
  outline: PropTypes.bool,
  ...buttonPropTypes,
};

function SolidButton({ variant = "primary", size = "normal", ...props }) {
  return (
    <BaseButton
      {...props}
      sx={{
        ...(size === "small" ? smallSize : normalSize),
        ...defaultButtonStyles,
        borderColor: (theme) => theme.buttons[variant].color,
        bg: (theme) => theme.buttons[variant].color,
        color: (theme) => theme.buttons[variant].text,
        borderRadius: "small",
        "&:hover:not([disabled])": {
          borderColor: (theme) => theme.buttons[variant].colorHover,
          bg: (theme) => theme.buttons[variant].colorHover,
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
        },
      }}
    />
  );
}
SolidButton.propTypes = buttonPropTypes;

function OutlineButton({ variant = "primary", size = "normal", ...props }) {
  return (
    <BaseButton
      {...props}
      sx={{
        ...defaultButtonStyles,
        ...(size === "small" ? smallSize : normalSize),
        borderColor: (theme) => theme.buttons[variant].color,
        bg: (theme) => theme.buttons[variant].text,
        color: (theme) => theme.buttons[variant].color,
        "&:hover:not([disabled])": {
          color: (theme) => theme.buttons[variant].colorHover,
          borderColor: (theme) => theme.buttons[variant].colorHover,
        },
        "&[disabled]": {
          color: "muted",
          borderColor: "muted",
        },
      }}
    />
  );
}
OutlineButton.propTypes = buttonPropTypes;

export function IconButton({ variant = "primary", size = "large", ...props }) {
  return (
    <BaseButton
      {...props}
      sx={{
        ...defaultButtonStyles,
        borderRadius: "20px",
        borderWidth: 0,
        lineHeight: 1,
        fontSize: size,
        bg: "transparent",
        padding: "4px 6px",
        color: (theme) => theme.buttons[variant].color,
        "&:hover:not([disabled])": {
          color: (theme) => theme.buttons[variant].text,
          bg: (theme) => theme.buttons.icon.bgHover,
        },
        "&[disabled]": {
          color: "text",
          bg: "neutral",
        },
      }}
    />
  );
}
IconButton.propTypes = buttonPropTypes;
