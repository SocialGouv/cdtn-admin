import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserForm } from "src/components/user/UserForm";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { getExpiryDate } from "src/lib/duration";
import { Message } from "theme-ui";
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
      secret_token_expires_at: getExpiryDate(
        parseInt(process.env.NEXT_PUBLIC_ACTIVATION_TOKEN_EXPIRES, 10)
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
      <Stack>
        {error && (
          <Message>
            <pre>{JSON.stringify(error, 0, 2)}</pre>
          </Message>
        )}
        <UserForm onSubmit={handleCreate} isAdmin={true} loading={fetching} />
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UserPage));
