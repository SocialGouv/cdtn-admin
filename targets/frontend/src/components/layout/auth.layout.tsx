import {
  Box,
  Toolbar,
  AppBar,
  IconButton,
  Drawer,
  Divider,
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

  const drawer = (
    <div>
      <Toolbar sx={{ height: headerHeight }}>
        <LogoAdmin />
      </Toolbar>
      <Divider />
      <Navigation />
    </div>
  );

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
        <Toolbar sx={{ height: headerHeight }}>
          <IconButton
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
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
          {drawer}
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
        <h1>{title}</h1>
        {children}
      </Box>
    </Box>
  );
}
