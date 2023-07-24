/** @jsxImportSource theme-ui */

import { AppBar, Toolbar } from "@mui/material";
import { LogoAdmin } from "./LogoAdmin";

const headerHeight = 70;

export function Header() {
  return (
    <>
      <AppBar position="fixed" color="transparent">
        <Toolbar sx={{ height: headerHeight }}>
          <LogoAdmin />
        </Toolbar>
      </AppBar>
      <Toolbar sx={{ height: headerHeight }} />
    </>
  );
}
