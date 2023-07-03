/** @jsxImportSource theme-ui */

import Link from "next/link";
import { useRouter } from "next/router";
import { IoMdContact } from "react-icons/io";
import { MenuButton, MenuItem } from "src/components/button";
import { Box, Flex, Image, Text } from "theme-ui";

import { useUser } from "../../hooks/useUser";

export function Header() {
  const { user, logout } = useUser();
  const router = useRouter();
  function updateProfile() {
    router.push("/user/account");
  }
  return (
    <Flex
      as="header"
      sx={{
        boxShadow: "medium",
        flexWrap: "wrap",
        justifyContent: "space-between",
        position: "relative",
      }}
      px={["small", "large"]}
      py="xxsmall"
    >
      <Link
        href="/"
        sx={{
          "&:hover": {
            color: "secondary",
          },
          alignItems: "center",
          color: "text",
          display: "inline-flex",
          textDecoration: "none",
          transition: "color .15s ease",
        }}
      >
        <Image
          src="/img/logo.png"
          alt="Ministère du travail"
          sx={{
            width: "77px",
          }}
        />
        <Box paddingLeft="small">
          <Box sx={{ fontSize: "large", lineHeight: "heading" }}>
            veille & administration
          </Box>
          <Box sx={{ fontSize: "small", fontWeight: 300 }}>
            Code du travail numérique
          </Box>
        </Box>
      </Link>
      {user && (
        <Flex sx={{ alignItems: "center", flexDirection: "row" }}>
          {" "}
          <IoMdContact sx={{ fontSize: "icons" }} />
          <Text color="heading" sx={{ fontWeight: "semibold", px: "xsmall" }}>
            {user?.name}
          </Text>
          <MenuButton>
            <MenuItem onSelect={updateProfile}>Mon compte</MenuItem>
            <MenuItem onSelect={logout}>Déconnexion</MenuItem>
          </MenuButton>
        </Flex>
      )}
    </Flex>
  );
}
