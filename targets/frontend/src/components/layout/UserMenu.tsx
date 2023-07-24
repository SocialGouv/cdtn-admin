import Link from "next/link";
import { Stack, Typography, Menu, MenuItem, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IoMdContact } from "react-icons/io";
import { useUser } from "../../hooks/useUser";
import { useState } from "react";

export function UserMenu() {
  const { user, logout } = useUser() as any;
  const [anchorMenu, setAnchorMenu] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorMenu);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorMenu(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorMenu(null);
  };
  return (
    <div style={{ flexBasis: "100%" }}>
      {user && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={2}
        >
          {" "}
          <IoMdContact sx={{ fontSize: "icons" }} />
          <Typography
            color="heading"
            sx={{ fontWeight: "semibold", px: "xsmall" }}
          >
            {user?.name}
          </Typography>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-haspopup="true"
            onClick={handleClick}
            sx={{ color: "white" }} // TODO: modify with theme
          >
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorMenu} open={open} onClose={handleClose}>
            <MenuItem component={Link} href="/user/account">
              Mon compte
            </MenuItem>
            <MenuItem onClick={logout}>Déconnexion</MenuItem>
          </Menu>
        </Stack>
      )}
    </div>
  );
}
