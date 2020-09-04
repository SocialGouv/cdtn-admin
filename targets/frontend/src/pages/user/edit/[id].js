/** @jsx jsx  */

import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { Layout } from "src/components/layout/auth.layout";
import { UserForm } from "src/components/user/UserForm";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useUser } from "src/hooks/useUser";
import { jsx } from "theme-ui";
import { useMutation } from "urql";

const getUserQuery = `
query getUser($id: uuid!) {
  user:auth_users_by_pk(id: $id) {
    __typename
    id
    email
    name
    active
    default_role
    roles: user_roles {
      role
    }
  }
}
`;

const saveUserMutation = `
mutation saveUser($id: uuid!, $name:String!, $email: citext!) {
  update_auth_users_by_pk(
    _set: {
    	name: $name,
    	email: $email,
    },
    pk_columns: { id: $id}
  ){ __typename }
}
`;

const saveRoleMutation = `
mutation saveRole($id: uuid!, $role:String!) {
  update_auth_user_roles(_set: {role: $role}, where: {
    user_id: {_eq: $id}
  }){
    returning { __typename }
  }
}
`;

export function EditUserPage({ errorCode, user }) {
  const router = useRouter();
  const { isAdmin } = useUser();
  const [userResult, saveUser] = useMutation(saveUserMutation);
  const [roleResult, saveRole] = useMutation(saveRoleMutation);
  function handleSubmit(data) {
    const { name, email, default_role } = data;
    let rolePromise = Promise.resolve();
    if (user.roles.every(({ role }) => role !== default_role)) {
      rolePromise = saveRole({ id: user.id, role: default_role });
    }
    rolePromise
      .then(() => saveUser({ email, id: user.id, name }))
      .then((result) => {
        if (!result.error) {
          router.push("/users");
        }
      });
  }
  return (
    <Layout errorCode={errorCode} title="Modifier mes informations">
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
EditUserPage.propTypes = {
  errorCode: PropTypes.number,
  user: PropTypes.object.isRequired,
};

EditUserPage.getInitialProps = async function ({ urqlClient, query }) {
  const { id } = query;
  const result = await urqlClient.query(getUserQuery, { id }).toPromise();
  if (!result.data?.user) {
    return { errorCode: 404, user: {} };
  }
  return { user: result.data.user };
};

export default withCustomUrqlClient(withUserProvider(EditUserPage));
