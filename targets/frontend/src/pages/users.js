/** @jsx jsx  */

import Link from "next/link";
import { IoIosAdd } from "react-icons/io";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { UserList } from "src/components/user/List";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Flex, jsx } from "theme-ui";

export function UserPage() {
  return (
    <Layout title="Gestion des utilisateurs">
      <Flex sx={{ alignItems: "center", justifyContent: "end" }}>
        <Link href="/user/new" passHref>
          <Button as="a" outline size="small">
            <IoIosAdd /> Ajouter un utilisateur
          </Button>
        </Link>
      </Flex>
      <UserList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UserPage));
