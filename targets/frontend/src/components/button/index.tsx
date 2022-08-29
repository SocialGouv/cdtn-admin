/** @jsxImportSource theme-ui */

import {
  AccordionButton as ReachAccordionButton,
  useAccordionItemContext,
} from "@reach/accordion";
import {
  Menu,
  MenuButton as ReachMenuButton,
  MenuItem as ReachMenuItem,
  MenuItemProps,
  MenuList,
} from "@reach/menu-button";
import PropTypes from "prop-types";
import React from "react";
import { IoIosArrowDown, IoIosArrowForward, IoMdMore } from "react-icons/io";
import type { Theme, ThemeUIStyleObject } from "theme-ui";
import {
  Box,
  Button as BaseButton,
  get,
  IconButton as BaseIconButton,
  NavLink,
} from "theme-ui";

type ButtonPropTypes = {
  children: React.ReactNode;
  type?: "button" | "reset" | "submit";
  disabled?: boolean;
  size?: "small" | "normal";
  variant?: "accent" | "secondary" | "primary" | "link";
  onClick?: (e: unknown) => void;
};

declare module "react" {
  interface Attributes {
    sx?: ThemeUIStyleObject;
  }
}

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
} as const;
const normalSize = {
  px: "xsmall",
  py: "xsmall",
};
const smallSize = {
  px: "xxsmall",
  py: "xxsmall",
};

type ButtonPropTypesWithRef = ButtonPropTypes & {
  ref: React.Ref<HTMLButtonElement>;
};

const SolidButton: React.FC<ButtonPropTypesWithRef> = React.forwardRef<
  HTMLButtonElement,
  ButtonPropTypes
>(function _SolidButton(
  { variant = "primary", size = "normal", type = "button", ...props },
  ref
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      sx={{
        ...defaultButtonStyles,
        ...(size === "small" ? smallSize : normalSize),
        "& :hover :not([disabled])": {
          bg: (theme: Theme) => get(theme, `buttons.${variant}.bgHover`),
          borderColor: (theme: Theme) =>
            get(theme, `buttons.${variant}.bgHover`),
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
          cursor: "default",
        },
        bg: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
        borderColor: (theme) => get(theme, `buttons.${variant}.bg`),
        borderRadius: "small",
        color: (theme: Theme) => get(theme, `buttons.${variant}.color`),
      }}
    />
  );
});

const OutlineButton: React.FC<ButtonPropTypesWithRef> = React.forwardRef<
  HTMLButtonElement,
  ButtonPropTypes
>(function _OutlineButton(
  { variant = "primary", size = "normal", type = "button", ...props },
  ref
) {
  return (
    <BaseButton
      {...props}
      type={type}
      ref={ref}
      sx={{
        ...defaultButtonStyles,
        ...(size === "small" ? smallSize : normalSize),
        "&:hover:not([disabled])": {
          borderColor: (theme: Theme) =>
            get(theme, `buttons.${variant}.bgHover`),
          color: (theme: Theme) => get(theme, `buttons.${variant}.bgHover`),
        },
        "&[disabled]": {
          borderColor: "muted",
          color: "muted",
        },
        bg: (theme: Theme) => get(theme, `buttons.${variant}.color`),
        borderColor: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
        color: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
      }}
    />
  );
});

type OutlineOrSolidButtonProps = ButtonPropTypes & { outline?: boolean };

export const Button: React.FC<OutlineOrSolidButtonProps> = React.forwardRef<
  HTMLButtonElement,
  OutlineOrSolidButtonProps
>(function _Button({ outline = false, ...props }, ref) {
  return outline ? (
    <OutlineButton ref={ref} {...props} />
  ) : (
    <SolidButton ref={ref} {...props} />
  );
});

type ButtonPropTypesWithSx = ButtonPropTypes & {
  size?: "small" | "large" | "normal";
  sx?: ThemeUIStyleObject;
  variant?: "primary" | "secondary";
};

export const IconButton: React.FC<ButtonPropTypesWithSx> = React.forwardRef<
  HTMLButtonElement,
  ButtonPropTypesWithSx
>(function _IconButton(
  { variant = "primary", sx = {}, size = "large", ...props },
  ref
) {
  return (
    <BaseIconButton
      data-debug={variant}
      {...props}
      ref={ref}
      sx={{
        ...defaultButtonStyles,
        "&:hover:not([disabled])": {
          bg: (theme: Theme) => get(theme, "buttons.icon.bgHover"),
          color: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
        },
        "&[disabled]": {
          bg: "neutral",
          color: "text",
        },
        border: "none",
        borderRadius: 32,
        color: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
        fontSize: size,
        lineHeight: 1,
        overflow: "hidden",
        ...sx,
      }}
    />
  );
});

export const MenuButton: React.FC<ButtonPropTypes> = ({
  variant = "primary",
  size = "large",
  children,
}) => {
  return (
    <Menu sx={{ position: "relative" }}>
      <ReachMenuButton
        sx={{
          ...defaultButtonStyles,
          "&:hover:not([disabled])": {
            bg: (theme: Theme) => get(theme, "buttons.icon.bgHover"),
            color: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
          },
          "&[disabled]": {
            bg: "neutral",
            color: "text",
          },
          bg: "transparent",
          border: "none",
          borderRadius: 32,
          color: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
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
};

export function MenuItem(
  props: Pick<
    MenuItemProps,
    "children" | "onSelect" | "disabled" | "index" | "valueText"
  >
): JSX.Element {
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

export function AccordionButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
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

export function ExpandedIcon(): JSX.Element {
  const { isExpanded } = useAccordionItemContext();
  return isExpanded ? <IoIosArrowDown /> : <IoIosArrowForward />;
}

export const NavButton: React.FC<ButtonPropTypes> = React.forwardRef<
  HTMLAnchorElement,
  ButtonPropTypes
>(function _SolidButton({ variant = "primary", ...props }, ref) {
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
          bg: (theme: Theme) => get(theme, `buttons.${variant}.bgHover`),
          borderColor: (theme: Theme) =>
            get(theme, `buttons.${variant}.bgHover`),
          color: (theme: Theme) => get(theme, `buttons.${variant}.color`),
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
        },
        bg: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
        borderColor: (theme: Theme) => get(theme, `buttons.${variant}.bg`),
        borderRadius: "small",
        color: (theme: Theme) => get(theme, `buttons.${variant}.color`),
        display: "inline-flex",
        fontWeight: "bold",
      }}
      {...props}
    />
  );
});
