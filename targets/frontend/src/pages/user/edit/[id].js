import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { UserForm } from "src/components/user/UserForm";
import { useMutation, useQuery } from "urql";

const getUserQuery = `
query getUser($id: uuid!) {
  user:auth_users_by_pk(id: $id) {
    __typename
    id
    email
    name
    isActive
    role
  }
}
`;

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
  const [result] = useQuery(getUserQuery, { user });
  const user = result.data.user;
  const [userResult, saveUser] = useMutation(saveUserMutation);

  if (result.error) {
    const error = new Error("user not found");
    error.statusCode = 404;
    return Promise.reject(error);
  }

  async function handleSubmit(data) {
    const { name, email, role } = data;
    await saveUser({ email, id: user.id, name, role });
    router.push("/users");
  }
  return (
    <Layout title="Modifier mes informations">
      <UserForm
        user={user}
        loading={userResult.fetching || roleResult.fetching}
        onSubmit={handleSubmit}
        isAdmin={isAdmin}
        backHref="/users"
      />
    </Layout>
  );
}

export default EditUserPage;
