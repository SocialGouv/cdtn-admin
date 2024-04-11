import {
  AlertColor,
  Box,
  Drawer,
  IconButton,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { useEffect, useState } from "react";
import { LogoAdmin } from "./LogoAdmin";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { fr } from "@codegouvfr/react-dsfr";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { SnackBar } from "../utils/SnackBar";
import Head from "next/head";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export type LayoutProps = {
  children: any;
  title?: string;
  disableHeadTag?: boolean;
};

const drawerWidth = 340;
const headerHeight = 70;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export function Layout({
  children,
  title,
  disableHeadTag = false,
}: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        router.push("/login");
      }
    });
  }, [router]);

  const handleDrawerToggle = () => {
    setMenuOpen(!menuOpen);
  };
  const theme = useTheme();

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const truncateError = (message: string, maxLength: number) => {
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      setSnack({
        open: true,
        message: truncateError(event.message, 300),
        severity: "error",
      });
    });

    window.addEventListener(
      "unhandledrejection",
      (event: PromiseRejectionEvent) => {
        setSnack({
          open: true,
          message: truncateError(event.reason.message, 300),
          severity: "error",
        });
      }
    );
  }

  return (
    <div>
      {!disableHeadTag && (
        <Head>
          <title>{title} | Admin cdtn</title>
        </Head>
      )}
      <Box sx={{ display: "flex" }}>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="persistent"
          open={menuOpen}
          onClose={handleDrawerToggle}
        >
          <DrawerHeader>
            <LogoAdmin />
            <IconButton onClick={handleDrawerToggle}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Navigation />
        </Drawer>
        <AppBar position="fixed" open={menuOpen}>
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                aria-label="ouvrir le menu"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 2,
                  color: fr.colors.decisions.background.default.grey.default,
                  ...(menuOpen && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography>{title}</Typography>
            </Box>
            <UserMenu />
          </Toolbar>
        </AppBar>
        <Main open={menuOpen}>
          <Toolbar sx={{ height: headerHeight }} />
          {children}
        </Main>
      </Box>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </div>
  );
}
