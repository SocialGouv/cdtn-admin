/** @jsx jsx */
import { jsx, Box, Image, Text } from "theme-ui";
import { IoMdContact } from "react-icons/io";
import { Button } from "src/components/button";
import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";
import { Container } from "next/app";

export function Header() {
  console.log("[header]");
  const { user, logout } = useAuth();
  console.log({ user });
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
            <Button variant="secondary" outline size="small" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        )}
      </header>
    </Container>
  );
}
