import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserForm } from "src/components/user/UserForm";

export function UserPage() {
  const router = useRouter();

  async function handleCreate({ name, email }: any) {
    console.log(name, email);
    const result = await fetch(`/api/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    const resultJson = await result.json();

    if (!result.ok) {
      alert(
        `Une erreur est survenue lors de la création du compte <=> ${resultJson.message}`
      );
      return;
    }

    router.push("/users");
  }

  return (
    <Layout title="Création de compte">
      <Stack>
        <UserForm onSubmit={handleCreate} />
      </Stack>
    </Layout>
  );
}

export default UserPage;
