import { useRouter } from "next/router";
import { useState } from "react";
import {
  Alert,
  Badge,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useMutation, useQuery } from "urql";

import { Button, MenuButton, MenuItem } from "../button";
import { Dialog } from "../dialog";
import { Check, Cross } from "../utils/icons";

const query = `
query getUsers {
  users: auth_users(where: {isDeleted: {_eq: false}}) {
    __typename
    id
    email
    name
    isActive
    isDeleted
    createdAt
    role
  }
}
`;

const deleteUserMutation = `
mutation deleteUser($id: uuid!, $name:String!, $email: citext!) {
  update_auth_users(_set: {
    name: $name,
    email: $email,
    password: "mot de passe",
    isDeleted: true
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
        <Stack direction="row" spacing={2} mt={4} justifyContent="end">
          <Button variant="outlined" onClick={close}>
            Annuler
          </Button>
          <Button variant="contained" onClick={onDeleteUser}>
            Supprimer l’utilisateur
          </Button>
        </Stack>
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
          {data.users.map(({ id, role, name, email, createdAt, isActive }) => (
            <TableRow key={id}>
              <TableCell align="center">
                <Badge variant={role === "super" ? "primary" : "secondary"}>
                  {role}
                </Badge>
              </TableCell>
              <TableCell>{name}</TableCell>
              <TableCell>{email}</TableCell>
              <TableCell>
                {new Date(createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell align="center">
                {isActive ? <Check /> : <Cross />}
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
          ))}
        </TableBody>
      </Table>
    </>
  );
}
