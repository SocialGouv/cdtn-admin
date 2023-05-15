import { Button } from "@mui/material";
import Link from "next/link";
import { IoIosAdd } from "react-icons/io";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserList } from "src/components/user/List";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Flex } from "theme-ui";

export function UserPage() {
  return (
    <Layout title="Gestion des utilisateurs">
      <Stack>
        <Flex sx={{ alignItems: "center", justifyContent: "flex-end" }}>
          <Link href="/user/new" passHref style={{ textDecoration: "none" }}>
            <Button variant="outlined" size="small">
              <IoIosAdd /> Ajouter un utilisateur
            </Button>
          </Link>
        </Flex>
        <UserList />
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UserPage));
