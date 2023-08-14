import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserForm } from "src/components/user/UserForm";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { getExpiryDate } from "src/lib/duration";
import { useMutation } from "urql";
import { Alert } from "@mui/material";

const registerUserMutation = `
mutation registerUser($user: auth_users_insert_input! ) {
  user: insert_auth_users_one( object: $user ) {
    id
    email
    __typename
  }
}
`;

const emailAccountMutation = `
mutation email($email: citext!, $secret_token: uuid!) {
	email_account_activation(email: $email, secret_token:$secret_token)
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
  const [, emailAccount] = useMutation(emailAccountMutation);
  const { fetching, error } = result;

  function handleCreate(data) {
    registerUser(prepareMutationData(data)).then((result) => {
      if (!result.error) {
        router.push("/users");
        const { email, secret_token } = result.data.user;
        emailAccount({ email, secret_token });
      }
    });
  }

  return (
    <Layout title="Création de compte">
      <Stack>
        {error && (
          <Alert severity="error">
            <pre>{JSON.stringify(error, 0, 2)}</pre>
          </Alert>
        )}
        <UserForm onSubmit={handleCreate} isAdmin={true} loading={fetching} />
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(UserPage));
