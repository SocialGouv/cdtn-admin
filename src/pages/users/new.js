/** @jsx jsx  */
import { jsx, Heading, NavLink } from "theme-ui";
import Head from "next/head";

import { withCustomUrqlClient } from "src/components/CustomUrqlClient";
import { withAuthProvider } from "src/hooks/useAuth";
import { Layout } from "src/components/layout/auth.layout";
import Link from "next/link";

export function UserPage() {
  return (
    <Layout>
      <Head>
        <title>Nouvel utilisateur | Admin cdtn </title>
      </Head>
      <Heading>Nouvel utilisateur</Heading>
      <Link href="/users" passHref>
        <NavLink>Retour</NavLink>
      </Link>
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(UserPage));
