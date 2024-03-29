import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
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
        <Box>
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
            <p>{user.role}</p>
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
                router.push("/users/edit");
              }}
            >
              Modifier mes informations
            </Button>

            <Button
              outline
              onClick={() => {
                router.push("/users/password");
              }}
            >
              Modifier mon mot de passe
            </Button>
          </Box>
        </Box>
      )}
    </Layout>
  );
}

export default UserPage;
