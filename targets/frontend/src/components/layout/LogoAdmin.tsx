import Link from "next/link";
import { Box, Stack } from "@mui/material";

export function LogoAdmin() {
  return (
    <Link
      href="/"
      style={{
        alignItems: "center",
        textDecoration: "none",
      }}
      className="fr-reset-link"
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
          <Box sx={{ fontSize: "18px", lineHeight: "heading" }}>
            veille & administration
          </Box>
          <Box sx={{ fontSize: "12px", fontWeight: 300 }}>
            Code du travail numérique
          </Box>
        </Stack>
      </Stack>
    </Link>
  );
}
