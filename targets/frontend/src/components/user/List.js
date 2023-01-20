/** @jsxImportSource theme-ui */

import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosCheckmark, IoMdCloseCircle } from "react-icons/io";
import { Badge, css, Message, Text } from "theme-ui";
import { useMutation, useQuery } from "urql";

import { Role } from "../../lib/auth/auth.const";
import { Button, MenuButton, MenuItem } from "../button";
import { Dialog } from "../dialog";
import { Inline } from "../layout/Inline";

const query = `
query getUsers {
  users: auth_users(where: {deleted: {_eq: false}}) {
    __typename
    id
    email
    name
    active
    deleted
    created_at
    default_role
    roles: user_roles {
      role
    }
  }
}
`;

const deleteUserMutation = `
mutation deleteUser($id: uuid!, $name:String!, $email: citext!) {
  update_auth_users(_set: {
    name: $name,
    email: $email,
    password: "mot de passe",
    deleted: true
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

export function UserList() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState();
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  const [result] = useQuery({
    query,
  });
  const { data, fetching, error } = result;
  const [, executeDelete] = useMutation(deleteUserMutation);

  function confirmDeleteUser(id, email) {
    setSelectedUser({ email, id });
    open();
  }

  function onDeleteUser() {
    if (!selectedUser?.id) {
      return;
    }
    executeDelete({
      email: `${selectedUser.id}@deleted.com`,
      id: selectedUser.id,
      name: selectedUser.id,
    });
    close();
  }

  if (fetching) return <p>chargement...</p>;
  if (error)
    return (
      <Message>
        <pre>{JSON.stringify(error, 0, 2)}</pre>
      </Message>
    );
  return (
    <>
      <Dialog
        isOpen={showDialog}
        onDismiss={close}
        ariaLabel="Supprimer l'utilisateur"
      >
        <Text>Etes vous sur de vouloir supprimer l’utilisateur</Text>
        <strong>{selectedUser?.email}</strong>
        <Inline>
          <Button onClick={onDeleteUser}>Supprimer l’utilisateur</Button>
          <Button variant="link" onClick={close}>
            Annuler
          </Button>
        </Inline>
      </Dialog>
      <table css={styles.table}>
        <thead>
          <tr>
            <Th align="center">Rôle</Th>
            <Th>Nom d’utilisateur</Th>
            <Th>Email</Th>
            <Th>Date de création</Th>
            <Th align="center">Activé</Th>
            <Th align="center">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {data.users.map(
            ({
              id,
              roles: [{ role } = {}],
              name,
              email,
              created_at,
              active,
            }) => (
              <Tr key={id}>
                <Td align="center">
                  <Badge
                    variant={role === Role.SUPER ? "primary" : "secondary"}
                  >
                    {role}
                  </Badge>
                </Td>
                <Td>{name}</Td>
                <Td>{email}</Td>
                <Td>{new Date(created_at).toLocaleDateString("fr-FR")}</Td>
                <Td align="center">
                  {active ? <IoIosCheckmark /> : <IoMdCloseCircle />}
                </Td>
                <Td align="center">
                  <MenuButton variant="secondary">
                    <MenuItem
                      onSelect={() =>
                        router.push("/user/edit/[id]", `/user/edit/${id}`)
                      }
                    >
                      Modifier
                    </MenuItem>
                    <MenuItem onSelect={() => confirmDeleteUser(id, email)}>
                      Supprimer
                    </MenuItem>
                  </MenuButton>
                </Td>
              </Tr>
            )
          )}
        </tbody>
      </table>
    </>
  );
}
const Tr = (props) => <tr css={styles.tr} {...props} />;

const cellPropTypes = {
  align: PropTypes.oneOf(["left", "right", "center"]),
};
const Th = ({ align = "left", ...props }) => (
  <th css={styles.th} sx={{ textAlign: align }} {...props} />
);
Th.propTypes = cellPropTypes;
const Td = ({ align = "left", ...props }) => (
  <td css={styles.td} {...props} sx={{ textAlign: align }} />
);
Td.propTypes = cellPropTypes;

const styles = {
  table: css({
    borderCollapse: "collapse",
    borderRadius: "small",
    overflow: "hidden",
    width: "100%",
  }),
  td: css({
    fontWeight: 300,
    px: "xsmall",
    py: "xxsmall",
    "tr:nth-of-type(even) &": {
      bg: "highlight",
    },
  }),
  th: css({
    borderBottom: "1px solid",
    fontSize: "medium",
    // bg: "info",
    // color: "white",
    fontWeight: "semibold",

    px: "xsmall",

    py: "xsmall",
  }),
};
