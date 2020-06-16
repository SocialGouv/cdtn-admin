import { jsx, Box, NavLink, Text } from "theme-ui";
import { useAuth } from "src/hooks/useAuth";
import Link from "next/link";
import { Li, List } from "../list";

/** @jsx jsx */
export function Nav() {
  const { user } = useAuth();
  const isAdmin = user?.roles.some(({ role }) => role === "admin");

  return (
    <Box as="nav" bg="highlight" padding="large" sx={{ flexBasis: "300px" }}>
      <Box>
        <Text>Navigation</Text>
        <List>
          {isAdmin && (
            <Li>
              <Link href="/users">
                <NavLink href="/users">Gestion des utilisateurs</NavLink>
              </Link>
            </Li>
          )}
        </List>
      </Box>
    </Box>
  );
}
