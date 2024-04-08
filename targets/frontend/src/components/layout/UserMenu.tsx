import Link from "next/link";
import {
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IoMdContact } from "react-icons/io";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { theme } from "src/theme";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { fr } from "@codegouvfr/react-dsfr";

export function UserMenu() {
  const { data } = useSession();
  const user = data?.user;
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
    <>
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
            label="Thème"
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
            sx={{ color: fr.colors.decisions.background.default.grey.default }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorMenu} open={open} onClose={handleClose}>
            <MenuItem component={Link} href="/users/account">
              Mon compte
            </MenuItem>
            <MenuItem
              onClick={() =>
                signOut({
                  redirect: true,
                  callbackUrl: "/login",
                })
              }
            >
              Déconnexion
            </MenuItem>
          </Menu>
        </Stack>
      )}
    </>
  );
}
