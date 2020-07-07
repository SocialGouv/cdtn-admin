/** @jsx jsx */
import React from "react";
import {
  jsx,
  Button as BaseButton,
  IconButton as BaseIconButton,
} from "theme-ui";
import PropTypes from "prop-types";

import {
  Menu,
  MenuButton as ReachMenuButton,
  MenuList,
  MenuItem as ReachMenuItem,
} from "@reach/menu-button";

import {
  AccordionButton as ReachAccordionButton,
  useAccordionItemContext,
} from "@reach/accordion";

import { IoMdMore, IoIosArrowForward, IoIosArrowDown } from "react-icons/io";

const buttonPropTypes = {
  variant: PropTypes.oneOf(["secondary", "primary", "link"]),
  size: PropTypes.oneOf(["small", "normal"]),
};

const defaultButtonStyles = {
  cursor: "pointer",
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  textAlign: "center",
  lineHeight: "inherit",
  textDecoration: "none",
  fontSize: "inherit",
  fontWeight: "bold",
  minWidth: 0,
  m: 0,
  p: 1,
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
    {outline ? <OutlineButton {...props} /> : <SolidButton {...props} />}
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
        ...defaultButtonStyles,
        ...(size === "small" ? smallSize : normalSize),
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
    <BaseIconButton
      {...props}
      sx={{
        ...defaultButtonStyles,
        lineHeight: 1,
        borderRadius: 32,
        overflow: "hidden",
        border: "none",
        fontSize: size,
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

export function MenuButton({ variant = "primary", size = "large", children }) {
  return (
    <Menu sx={{ position: "relative" }}>
      <ReachMenuButton
        sx={{
          ...defaultButtonStyles,
          borderRadius: 32,
          height: 32,
          width: 32,
          padding: 0,
          border: "none",
          bg: "transparent",
          overflow: "hidden",
          justifyContent: "center",
          lineHeight: 1,
          fontSize: size,
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
      >
        <div aria-label="Actions">
          <IoMdMore />
        </div>
      </ReachMenuButton>
      <MenuList sx={{ bg: "white", right: 0, boxShadow: "large" }}>
        {children}
      </MenuList>
    </Menu>
  );
}

MenuButton.propTypes = {
  ...buttonPropTypes,
};

export function MenuItem(props) {
  return (
    <ReachMenuItem
      {...props}
      sx={{
        "&[data-selected]": {
          color: "white",
          bg: "secondary",
        },
      }}
    />
  );
}

export function AccordionButton({ children, ...props }) {
  return (
    <ReachAccordionButton
      {...props}
      sx={{
        ...defaultButtonStyles,
        color: "text",
        bg: "white",
        border: "none",
        "&[aria-expanded=true]": {
          color: "accent",
        },
      }}
    >
      <ExpandedIcon />
      {children}
    </ReachAccordionButton>
  );
}
AccordionButton.propTypes = {
  children: PropTypes.node,
};

export function ExpandedIcon() {
  const { isExpanded } = useAccordionItemContext();
  return isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />;
}
