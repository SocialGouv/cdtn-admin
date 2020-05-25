/** @jsx jsx  */
import { jsx, Heading, NavLink, Field } from "theme-ui";
import Head from "next/head";

import { withCustomUrqlClient } from "src/components/CustomUrqlClient";
import { withAuthProvider } from "src/hooks/useAuth";
import { Layout } from "src/components/layout/auth.layout";
import Link from "next/link";
import { Button } from "src/components/button";

export function UserPage() {
  return (
    <Layout>
      <Head>
        <title>Création de compte | Admin cdtn </title>
      </Head>
      <Heading>Creation de compte</Heading>
      <Link href="/users" passHref>
        <NavLink>Retour</NavLink>
      </Link>
      <form>
        <Field name="username" label="Nom d'utilisateur" />
        <Field name="email" label="Adresse email" />
        <Button>Créer un compte</Button>
      </form>
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(UserPage));
