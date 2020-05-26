/** @jsx jsx  */
import Head from "next/head";
import Link from "next/link";
import { IoIosAdd } from "react-icons/io";
import { Button } from "src/components/button";
import { withCustomUrqlClient } from "src/components/CustomUrqlClient";
import { Layout } from "src/components/layout/auth.layout";
import { UserList } from "src/components/UserList";
import { withAuthProvider } from "src/lib/auth";
import { Flex, Heading, jsx } from "theme-ui";

export function UserPage() {
  return (
    <Layout>
      <Head>
        <title>Gestion des utilisateurs | Admin cdtn </title>
      </Head>
      <Flex sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Heading>Gestion des utilisateurs</Heading>

        <Link href="/users/new" passHref>
          <Button as="a" outline size="small">
            <IoIosAdd /> Ajouter un utilisateur
          </Button>
        </Link>
      </Flex>
      <UserList />
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(UserPage));
