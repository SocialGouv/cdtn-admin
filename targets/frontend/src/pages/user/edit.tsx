import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { UserForm } from "src/components/user/UserForm";
import { useSession } from "next-auth/react";
import { useMutation } from "urql";

const saveUserMutation = `
mutation saveUser($id: uuid!, $name:String!, $email: citext!, $role: String!) {
  update_auth_users(_set: {
    name: $name,
    email: $email,
    role: $role
    },
    where: {
    id: {_eq: $id}
    }
  ){
    returning {
      __typename
    }
  }
}
`;

export function EditUserPage() {
  const { data } = useSession();
  const user = data?.user;
  const router = useRouter();
  const [userResult, saveUser] = useMutation(saveUserMutation);
  function handleSubmit(data: any) {
    if (!user) return;
    const { name, email, role } = data;
    saveUser({ email, id: user.id, name, role });
    router.push("/user");
  }
  return (
    <Layout title="Modifier mes informations">
      {user && (
        <UserForm
          user={user}
          loading={userResult.fetching}
          onSubmit={handleSubmit}
          isAdmin={user.role === "super"}
          backHref="/user/account"
        />
      )}
    </Layout>
  );
}

export default EditUserPage;
