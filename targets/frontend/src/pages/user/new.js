import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { UserForm } from "src/components/user/UserForm";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { getExpiryDate } from "src/lib/duration";
import { useMutation } from "urql";
import { Alert } from "@mui/material";
import { ACTIVATION_TOKEN_EXPIRES } from "../../config";

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
mutation email($email: citext!) {
	email_account_activation(email: $email)
}
`;

function prepareMutationData(input) {
  return {
    user: {
      ...input,
      secret_token_expires_at: getExpiryDate(ACTIVATION_TOKEN_EXPIRES),
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
        const { email } = result.data.user;
        emailAccount({ email });
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

export default withCustomUrqlClient(UserPage);
