import { Button } from "@mui/material";
import { IoIosAdd } from "react-icons/io";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserList } from "src/components/user/List";
import { Box } from "@mui/material";
import { useRouter } from "next/router";

export function UserPage() {
  const router = useRouter();

  const onDeleteUser = async (userId: string, name: string) => {
    const result = await fetch(`/api/users/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, name }),
    });

    const resultJson = await result.json();

    if (!result.ok) {
      alert(`Un problème est survenu, l'erreur est : ${resultJson.message}`);
      return false;
    }

    alert("L'utilisateur a été supprimé avec succès");

    return true;
  };

  return (
    <Layout title="Gestion des utilisateurs">
      <Stack>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={() => router.push("/users/new")}>
            <IoIosAdd /> Ajouter un utilisateur
          </Button>
        </Box>
        <UserList onDeleteUser={onDeleteUser} />
      </Stack>
    </Layout>
  );
}

export default UserPage;
