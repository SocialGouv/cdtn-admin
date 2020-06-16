/** @jsx jsx  */

import Link from "next/link";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { useAuth } from "src/hooks/useAuth";
import { withAuthProvider } from "src/lib/auth";
import { jsx, Label, Text } from "theme-ui";

export function UserPage() {
  const { user } = useAuth();

  return (
    <Layout title="Mon compte">
      {user && (
        <Stack>
          <div>
            <Label>Nom d’utilisateur</Label>
            <Text>{user.name}</Text>
          </div>
          <div>
            <Label>email</Label>
            <Text>{user.email}</Text>
          </div>
          <div>
            <Label>role</Label>
            <Text>{user.roles[0].role}</Text>
          </div>
          <Inline>
            <Link href="/user/edit" passHref>
              <Button as="a" size="small" variant="primary">
                Modifier mes Informations
              </Button>
            </Link>
            <Link href="/user/password" passHref>
              <Button as="a" size="small" variant="secondary" outline>
                Modifier mon mot de passe
              </Button>
            </Link>
          </Inline>
        </Stack>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(UserPage));
