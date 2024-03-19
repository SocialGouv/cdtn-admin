import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Box } from "@mui/material";

export function UserPage() {
  const { data } = useSession();
  const user = data?.user;
  const router = useRouter();

  return (
    <Layout title="Mon compte">
      {user && (
        <Stack>
          <div>
            <p className="fr-text--heavy">Nom d’utilisateur</p>
            <p>{user.name}</p>
          </div>
          <div>
            <p className="fr-text--heavy">email</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="fr-text--heavy">role</p>
            <p>{user.roles[0].role}</p>
          </div>
          <Box
            style={{
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              width: "300px",
            }}
          >
            <Button
              style={{
                marginBottom: "20px",
              }}
              onClick={() => {
                router.push("/user/edit");
              }}
            >
              Modifier mes informations
            </Button>

            <Button
              outline
              onClick={() => {
                router.push("/user/password");
              }}
            >
              Modifier mon mot de passe
            </Button>
          </Box>
        </Stack>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(UserPage);
