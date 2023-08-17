import Link from "next/link";
import {
  Stack,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IoMdContact } from "react-icons/io";
import { useUser } from "../../hooks/useUser";
import { useState } from "react";
import { theme } from "src/theme";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";

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
  const { isDark, setIsDark } = useIsDark();

  return (
    <div>
      {user && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={2}
        >
          <FormControlLabel
            control={
              <Switch
                checked={isDark}
                onChange={(event) => setIsDark(event.target.checked)}
                inputProps={{ "aria-label": "controlled" }}
              />
            }
            label="Dark mode"
          />
          <IoMdContact style={{ fontSize: theme.fontSizes.icons }} />
          <Typography
            style={{
              fontWeight: theme.fontWeights.semibold,
              paddingLeft: theme.space.xsmall,
              paddingRight: theme.space.xsmall,
            }}
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
