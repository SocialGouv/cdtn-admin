import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserForm } from "src/components/user/UserForm";

export function UserPage() {
  const router = useRouter();

  function handleCreate({ name, email }: any) {
    console.log(name, email);
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
