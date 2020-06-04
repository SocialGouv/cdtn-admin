/** @jsx jsx */
import { Container } from "next/app";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoMdContact } from "react-icons/io";
import { MenuButton, MenuItem } from "src/components/button";
import { Box, Image, jsx, Text } from "theme-ui";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  function updateProfile() {
    router.push("/user/account");
  }
  return (
    <Container>
      <header
        sx={{
          px: ["small", "large"],
          py: "xxsmall",
          display: "flex",
          boxShadow: "medium",
          justifyContent: "space-between",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        <Link href="/">
          <a
            sx={{
              textDecoration: "none",
              color: "text",
              transition: "color .15s ease",
              "&:hover": {
                color: "secondary",
              },
              display: "inline-flex",
              alignItems: "center",
            }}
            href="/"
            title="Retour à l'accueil"
          >
            <Image
              src="/img/logo.png"
              alt="Ministère du travail"
              sx={{
                width: "77px",
              }}
            />
            <Box paddingLeft="small">
              <Text sx={{ lineHeight: "heading", fontSize: "large" }}>
                veille & administration
              </Text>
              <Text sx={{ fontWeight: 300, fontSize: "small" }}>
                Code du travail numérique
              </Text>
            </Box>
          </a>
        </Link>
        {user && (
          <div
            sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
          >
            {" "}
            <IoMdContact sx={{ fontSize: "icons" }} />
            <Text color="heading" sx={{ fontWeight: "semibold", px: "xsmall" }}>
              {user?.name}
            </Text>
            <MenuButton>
              <MenuItem onSelect={updateProfile}>Mon compte</MenuItem>
              <MenuItem onSelect={logout}>Déconnexion</MenuItem>
            </MenuButton>
          </div>
        )}
      </header>
    </Container>
  );
}
