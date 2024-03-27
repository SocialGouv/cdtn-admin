import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { UserForm } from "src/components/user/UserForm";
import { useMutation, useQuery } from "urql";

const saveUserMutation = `
mutation saveUser($id: uuid!, $name:String!, $email: citext!, $role: String!) {
  update_auth_users_by_pk(
    _set: {
      name: $name,
      email: $email,
      role: $role
    },
    pk_columns: { id: $id}
  ){ __typename }
}
`;

export function EditUserPage() {
  const router = useRouter();
  const { data } = useSession();
  const user = data?.user;
  const [userResult, saveUser] = useMutation(saveUserMutation);

  async function handleSubmit(data: any) {
    if (!user) return;
    const { name, email, role } = data;
    await saveUser({ email, id: user.id, name, role });
    router.push("/users");
  }
  return (
    <Layout title="Modifier mes informations">
      <UserForm
        user={user}
        loading={userResult.fetching}
        onSubmit={handleSubmit}
        isAdmin={user?.role === "admin"}
        backHref="/users"
      />
    </Layout>
  );
}

export default EditUserPage;
