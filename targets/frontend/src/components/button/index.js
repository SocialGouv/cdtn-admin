/** @jsxImportSource theme-ui */

import {
  AccordionButton as ReachAccordionButton,
  useAccordionItemContext,
} from "@reach/accordion";
import {
  Menu,
  MenuButton as ReachMenuButton,
  MenuItem as ReachMenuItem,
  MenuList,
} from "@reach/menu-button";
import PropTypes from "prop-types";
import React from "react";
import { IoIosArrowDown, IoIosArrowForward, IoMdMore } from "react-icons/io";
import {
  Box,
  Button as BaseButton,
  IconButton as BaseIconButton,
  NavLink,
} from "theme-ui";

const buttonPropTypes = {
  size: PropTypes.oneOf(["small", "normal"]),
  variant: PropTypes.oneOf(["accent", "secondary", "primary", "link"]),
};

const defaultButtonStyles = {
  alignItems: "center",
  appearance: "none",
  borderRadius: "small",
  borderStyle: "solid",
  borderWidth: 2,
  cursor: "pointer",
  display: "inline-flex",
  fontFamily: "muli",
  fontSize: "inherit",
  fontWeight: "bold",
  lineHeight: "inherit",
  m: 0,
  minWidth: 0,
  textAlign: "center",
  textDecoration: "none",
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

export const Button = React.forwardRef(function _Button(
  { outline, ...props },
  ref
) {
  return outline ? (
    <OutlineButton ref={ref} {...props} />
  ) : (
    <SolidButton ref={ref} {...props} />
  );
});
Button.propTypes = {
  outline: PropTypes.bool,
  ...buttonPropTypes,
};

const SolidButton = React.forwardRef(function _SolidButton(
  { variant = "primary", size = "normal", ...props },
  ref
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      sx={{
        ...defaultButtonStyles,
        ...(size === "small" ? smallSize : normalSize),
        "&:hover:not([disabled])": {
          bg: (theme) => theme.buttons[variant].bgHover,
          borderColor: (theme) => theme.buttons[variant].bgHover,
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
          cursor: "default",
        },
        bg: (theme) => theme.buttons[variant].bg,
        borderColor: (theme) => theme.buttons[variant].bg,
        borderRadius: "small",
        color: (theme) => theme.buttons[variant].color,
      }}
    />
  );
});
SolidButton.propTypes = buttonPropTypes;

const OutlineButton = React.forwardRef(function _OutlineButton(
  { variant = "primary", size = "normal", ...props },
  ref
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      sx={{
        ...defaultButtonStyles,
        ...(size === "small" ? smallSize : normalSize),
        "&:hover:not([disabled])": {
          borderColor: (theme) => theme.buttons[variant].bgHover,
          color: (theme) => theme.buttons[variant].bgHover,
        },
        "&[disabled]": {
          borderColor: "muted",
          color: "muted",
        },
        bg: (theme) => theme.buttons[variant].color,
        borderColor: (theme) => theme.buttons[variant].bg,
        color: (theme) => theme.buttons[variant].bg,
      }}
    />
  );
});
OutlineButton.propTypes = buttonPropTypes;

export const IconButton = React.forwardRef(function _IconButton(
  { variant = "primary", size = "large", sx, ...props },
  ref
) {
  return (
    <BaseIconButton
      {...props}
      ref={ref}
      sx={{
        ...defaultButtonStyles,
        "&:hover:not([disabled])": {
          bg: (theme) => theme.buttons.icon.bgHover,
          color: (theme) => theme.buttons[variant].bg,
        },
        "&[disabled]": {
          bg: "neutral",
          color: "text",
        },
        border: "none",
        borderRadius: 32,
        color: (theme) => theme.buttons[variant].bg,
        fontSize: size,
        lineHeight: 1,
        overflow: "hidden",
        ...sx,
      }}
    />
  );
});
IconButton.propTypes = buttonPropTypes;

export function MenuButton({ variant = "primary", size = "large", children }) {
  return (
    <Menu sx={{ position: "relative" }}>
      <ReachMenuButton
        sx={{
          ...defaultButtonStyles,
          "&:hover:not([disabled])": {
            bg: (theme) => theme.buttons.icon.bgHover,
            color: (theme) => theme.buttons[variant].bg,
          },
          "&[disabled]": {
            bg: "neutral",
            color: "text",
          },
          bg: "transparent",
          border: "none",
          borderRadius: 32,
          color: (theme) => theme.buttons[variant].bg,
          fontSize: size,
          height: 32,
          justifyContent: "center",
          lineHeight: 1,
          overflow: "hidden",
          padding: 0,
          width: 32,
        }}
      >
        <div aria-label="Actions">
          <IoMdMore />
        </div>
      </ReachMenuButton>
      <MenuList sx={{ bg: "white", boxShadow: "large", right: 0 }}>
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
          bg: "secondary",
          color: "white",
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
        "&[aria-expanded=true]": {
          color: "accent",
        },
        bg: "white",
        border: "none",
        color: "text",
      }}
    >
      <Box sx={{ px: "xxsmall" }}>
        <ExpandedIcon />
      </Box>
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

export const NavButton = React.forwardRef(function _SolidButton(
  { variant = "primary", ...props },
  ref
) {
  return (
    <NavLink
      ref={ref}
      color="white"
      px="xsmall"
      py="xxsmall"
      sx={{
        ...defaultButtonStyles,
        "&:active": { color: "white" },
        "&:focus": { color: "link" },
        "&:hover:not([disabled])": {
          bg: (theme) => theme.buttons[variant].bgHover,
          borderColor: (theme) => theme.buttons[variant].bgHover,
          color: (theme) => theme.buttons[variant].color,
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
        },
        bg: (theme) => theme.buttons[variant].bg,
        borderColor: (theme) => theme.buttons[variant].bg,
        borderRadius: "small",
        color: (theme) => theme.buttons[variant].color,
        display: "inline-flex",
        fontWeight: "bold",
      }}
      {...props}
    />
  );
});
NavButton.propTypes = buttonPropTypes;
