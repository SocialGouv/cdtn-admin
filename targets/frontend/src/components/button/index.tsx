import React from "react";
import {
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
import { useAccordionItemContext } from "@reach/accordion";

type ButtonPropTypes = {
  children: React.ReactNode;
  type?: "button" | "reset" | "submit";
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  variant?: "contained" | "outlined" | "text";
  onClick?: (e: unknown) => void;
};

const SolidButton: React.FC<ButtonPropTypes> = ({
  variant = "contained",
  size = "medium",
  ...props
}) => {
  return (
    <MuiButton
      {...props}
      variant={variant}
      size={size}
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
        borderRadius: "small",
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
        color: "primary.main",
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

export function AccordionButton({
  children,
}: React.ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <MuiButton
      sx={{
        borderRadius: "small",
        fontWeight: "bold",
        textTransform: "none",
      }}
    >
      <Box sx={{ px: "xxsmall" }}>
        <ExpandedIcon />
      </Box>
      {children}
    </MuiButton>
  );
}

export const MenuItem: React.FC<ButtonPropTypes> = ({ children, ...props }) => {
  return (
    <MenuItemButton
      {...props}
      sx={{
        borderRadius: "small",
        fontWeight: "bold",
        textTransform: "none",
      }}
    >
      {children}
    </MenuItemButton>
  );
};

export function ExpandedIcon(): JSX.Element {
  const { isExpanded } = useAccordionItemContext();
  return isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />;
}

export const NavButton: React.FC<ButtonPropTypes> = ({
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
