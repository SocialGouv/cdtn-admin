import Link from "next/link";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useUser } from "src/hooks/useUser";
import { InputLabel as Label } from "@mui/material";
import { Box } from "@mui/material";

export function UserPage() {
  const { user } = useUser();

  return (
    <Layout title="Mon compte">
      {user && (
        <Stack>
          <div>
            <Label>Nom d’utilisateur</Label>
            <p>{user.name}</p>
          </div>
          <div>
            <Label>email</Label>
            <p>{user.email}</p>
          </div>
          <div>
            <Label>role</Label>
            <p>{user.roles[0].role}</p>
          </div>
          <Box
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Link href="/user/edit" passHref style={{ textDecoration: "none" }}>
              <Button size="small">Modifier mes informations</Button>
            </Link>
            <Link
              href="/user/password"
              passHref
              style={{ textDecoration: "none", marginTop: "10px" }}
            >
              <Button size="small" outline>
                Modifier mon mot de passe
              </Button>
            </Link>
          </Box>
        </Stack>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UserPage));
