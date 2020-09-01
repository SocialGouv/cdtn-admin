/** @jsx jsx */
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
  jsx,
} from "theme-ui";

const buttonPropTypes = {
  size: PropTypes.oneOf(["xsmall", "small", "normal"]),
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

export const Button = React.forwardRef(({ outline, ...props }, ref) =>
  outline ? (
    <OutlineButton ref={ref} {...props} />
  ) : (
    <SolidButton ref={ref} {...props} />
  )
);
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
        "&:hover:not([disabled])": {
          bg: (theme) => theme.buttons[variant].bgHover,
          borderColor: (theme) => theme.buttons[variant].bgHover,
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
        },
        bg: (theme) => theme.buttons[variant].bg,
        borderColor: (theme) => theme.buttons[variant].bg,
        borderRadius: "small",
        color: (theme) => theme.buttons[variant].color,
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
}
OutlineButton.propTypes = buttonPropTypes;

export function IconButton({ variant = "primary", size = "large", ...props }) {
  return (
    <BaseIconButton
      {...props}
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
