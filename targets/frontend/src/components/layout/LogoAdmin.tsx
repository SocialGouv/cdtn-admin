import Link from "next/link";
import { Box, Stack } from "@mui/material";

export function LogoAdmin() {
  return (
    <Link
      href="/"
      style={{
        alignItems: "center",
        color: "#3e486e",
        textDecoration: "none",
      }}
    >
      <Stack direction="row">
        <Box
          component="img"
          src="/img/logo.png"
          alt="Ministère du travail"
          sx={{
            width: "77px",
          }}
        />
        <Stack direction="column" justifyContent="center" textAlign="center">
          <Box sx={{ fontSize: "large", lineHeight: "heading" }}>
            veille & administration
          </Box>
          <Box sx={{ fontSize: "small", fontWeight: 300 }}>
            Code du travail numérique
          </Box>
        </Stack>
      </Stack>
    </Link>
  );
}
