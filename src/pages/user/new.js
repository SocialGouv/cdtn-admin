/** @jsx jsx  */
import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { UserForm } from "src/components/user/UserForm";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withAuthProvider } from "src/lib/auth";
import { Alert, jsx } from "theme-ui";
import { useMutation } from "urql";

const registerUserMutation = `
mutation registerUser($user: auth_users_insert_input! ) {
  insert_auth_users( objects: [$user] ) {
    returning {
      id
      __typename
    }
  }
}
`;

function prepareMutationData(input) {
  return {
    user: {
      ...input,
      secret_token_expires_at: parseInt(
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRES,
        10
      ),
      user_roles: { data: { role: input.default_role } },
    },
  };
}
export function UserPage() {
  const router = useRouter();
  const [result, registerUser] = useMutation(registerUserMutation);
  const { fetching, error } = result;

  function handleCreate(data) {
    registerUser(prepareMutationData(data)).then((result) => {
      if (!result.error) {
        router.push("/users");
      }
    });
  }

  return (
    <Layout title="Création de compte">
      {error && (
        <Alert>
          <pre>{JSON.stringify(error, 0, 2)}</pre>
        </Alert>
      )}
      <UserForm onSubmit={handleCreate} isAdmin={true} loading={fetching} />
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(UserPage));
