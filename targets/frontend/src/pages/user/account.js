import Link from "next/link";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useUser } from "src/hooks/useUser";
import { InputLabel as Label, Text } from "@mui/material";

export function UserPage() {
  const { user } = useUser();

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
            <Link href="/user/edit" passHref style={{ textDecoration: "none" }}>
              <Button size="small" variant="primary">
                Modifier mes informations
              </Button>
            </Link>
            <Link
              href="/user/password"
              passHref
              style={{ textDecoration: "none" }}
            >
              <Button size="small" variant="secondary" outline>
                Modifier mon mot de passe
              </Button>
            </Link>
          </Inline>
        </Stack>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UserPage));
