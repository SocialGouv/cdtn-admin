/** @jsx jsx  */
import Head from "next/head";
import Link from "next/link";
import { Button } from "src/components/button";
import { withCustomUrqlClient } from "src/components/CustomUrqlClient";
import { Layout } from "src/components/layout/auth.layout";
import { withAuthProvider } from "src/lib/auth";
import { Field, Heading, jsx, NavLink } from "theme-ui";

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
