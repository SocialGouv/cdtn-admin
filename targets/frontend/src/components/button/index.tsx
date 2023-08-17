import React from "react";
import {
  ButtonProps,
  Button as MuiButton,
  IconButton as MuiIconButton,
} from "@mui/material";
import { Menu, MenuItem as MenuItemButton } from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Box } from "@mui/material";
import { theme } from "src/theme";

type ButtonPropTypes = {
  children: React.ReactNode;
  type?: "button" | "reset" | "submit";
  disabled?: boolean;
  variant?: "contained" | "outlined" | "text";
  onClick?: (e: unknown) => void;
  sx?: Record<string, unknown>;
} & ButtonProps;

const SolidButton: React.FC<ButtonPropTypes> = ({
  variant = "contained",
  ...props
}) => {
  return (
    <MuiButton
      {...props}
      variant={variant}
      sx={{
        borderRadius: "small",
        fontWeight: "bold",
        textTransform: "none",
      }}
    />
  );
};

const OutlineButton: React.FC<ButtonPropTypes> = ({
  variant = "outlined",
  size = "medium",
  ...props
}) => {
  return (
    <MuiButton
      {...props}
      variant={variant}
      size={size}
      sx={{
        fontWeight: "bold",
        textTransform: "none",
      }}
    />
  );
};

type OutlineOrSolidButtonProps = ButtonPropTypes & { outline?: boolean };

export const Button: React.FC<OutlineOrSolidButtonProps> = ({
  outline = false,
  ...props
}) => {
  return outline ? <OutlineButton {...props} /> : <SolidButton {...props} />;
};

type ButtonPropTypesWithSx = ButtonPropTypes & {
  size?: "small" | "large" | "medium";
  sx?: React.CSSProperties;
  variant?: "contained" | "outlined";
};

export const IconButton: React.FC<ButtonPropTypesWithSx> = ({
  variant = "contained",
  sx = {},
  size = "large",
  ...props
}) => {
  return (
    <MuiIconButton
      {...props}
      sx={{
        borderRadius: 32,
        fontSize: size,
        overflow: "hidden",
        ...sx,
      }}
    />
  );
};

export const MenuButton: React.FC<ButtonPropTypes> = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MuiIconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          borderRadius: 32,
          color: "primary.main",
          fontSize: "large",
          overflow: "hidden",
        }}
      >
        <MoreVertIcon />
      </MuiIconButton>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};

type AccordionProps = {
  items: React.ReactNode[] | React.ReactNode;
  children: React.ReactNode;
};

export function AccordionButton({
  children,
  items,
}: AccordionProps): JSX.Element {
  const [isExpanded, setIsExpanded] = React.useState(false);
  return (
    <>
      <MuiButton
        style={{
          width: "100%",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Box>{isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}</Box>
        {children}
      </MuiButton>
      {isExpanded && items}
    </>
  );
}

export const MenuItem: React.FC<any> = ({ children, ...props }) => {
  return (
    <MenuItemButton
      {...props}
      sx={{
        borderRadius: theme.space.small,
        fontWeight: "bold",
        textTransform: "none",
      }}
    >
      {children}
    </MenuItemButton>
  );
};

export const NavButton: React.FC<ButtonPropTypes> = ({
  variant = "contained",
  ...props
}) => {
  return (
    <MuiButton
      {...props}
      variant={variant}
      sx={{
        borderRadius: theme.space.small,
        fontWeight: "bold",
        textTransform: "none",
      }}
    />
  );
};
