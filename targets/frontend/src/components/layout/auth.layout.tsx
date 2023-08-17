import {
  Box,
  Toolbar,
  AppBar,
  IconButton,
  Drawer,
  Divider,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Head from "next/head";

import { useState } from "react";
import { LogoAdmin } from "./LogoAdmin";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";

export type LayoutProps = {
  children: any;
  title?: string;
};

const drawerWidth = 340;
const headerHeight = 70;

export function Layout({ children, title }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Head>
        <title>{title} | Admin cdtn</title>
      </Head>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar
          sx={{
            height: headerHeight,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" }, color: "white" }} // TODO change with theme
          >
            <MenuIcon />
          </IconButton>
          <Typography>{title}</Typography>
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="Admin Menus"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Toolbar sx={{ height: headerHeight }}>
            <LogoAdmin />
          </Toolbar>
          <Divider />
          <Navigation />
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          <Toolbar sx={{ height: headerHeight }}>
            <LogoAdmin />
          </Toolbar>
          <Divider />
          <Navigation />
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ height: headerHeight }} />
        {children}
      </Box>
    </Box>
  );
}
