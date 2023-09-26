import { useRouter } from "next/router";
import { useState } from "react";
import {
  Alert,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMutation, useQuery } from "urql";

import { Role } from "../../lib/auth/auth.const";
import { Button, MenuButton, MenuItem } from "../button";
import { Dialog } from "../dialog";
import { Inline } from "../layout/Inline";
import { Check, Cross } from "../utils/icons";

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
      email: `${selectedUser.id}@gouv.fr`,
      id: selectedUser.id,
      name: selectedUser.id,
    });
    close();
  }

  if (fetching) return <p>chargement...</p>;
  if (error)
    return (
      <Alert severity="error">
        <pre>{JSON.stringify(error, 0, 2)}</pre>
      </Alert>
    );
  return (
    <>
      <Dialog
        isOpen={showDialog}
        onDismiss={close}
        ariaLabel="Supprimer l'utilisateur"
      >
        <p>Etes vous sur de vouloir supprimer l’utilisateur</p>
        <strong>{selectedUser?.email}</strong>
        <Inline>
          <Button onClick={onDeleteUser}>Supprimer l’utilisateur</Button>
          <Button variant="text" onClick={close}>
            Annuler
          </Button>
        </Inline>
      </Dialog>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Rôle</TableCell>
            <TableCell>Nom d’utilisateur</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Date de création</TableCell>
            <TableCell align="center">Activé</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.users.map(
            ({
              id,
              roles: [{ role } = {}],
              name,
              email,
              created_at,
              active,
            }) => (
              <TableRow key={id}>
                <TableCell align="center">
                  <Badge
                    variant={role === Role.SUPER ? "primary" : "secondary"}
                  >
                    {role}
                  </Badge>
                </TableCell>
                <TableCell>{name}</TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>
                  {new Date(created_at).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell align="center">
                  {active ? <Check /> : <Cross />}
                </TableCell>
                <TableCell align="center">
                  <MenuButton variant="secondary">
                    <MenuItem
                      onClick={() =>
                        router.push("/user/edit/[id]", `/user/edit/${id}`)
                      }
                    >
                      Modifier
                    </MenuItem>
                    <MenuItem onClick={() => confirmDeleteUser(id, email)}>
                      Supprimer
                    </MenuItem>
                  </MenuButton>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </>
  );
}
