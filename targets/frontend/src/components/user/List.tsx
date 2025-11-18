import { use, useEffect, useState } from "react";
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
import { useQuery } from "urql";

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

type Props = {
  onDeleteUser: (userId: string, userName: string) => Promise<boolean>;
  refresh?: boolean;
};

export function UserList({ onDeleteUser }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>();
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  const [result, executeQuery] = useQuery({
    query,
  });
  const { data, fetching, error } = result;
  const users = data?.users || [];

  function confirmDeleteUser(id: string, email: string, userName: string) {
    setSelectedUser({ email, id, userName });
    open();
  }

  async function onClickDeleteUser() {
    if (!selectedUser?.id) {
      return;
    }
    close();
    const result = await onDeleteUser(selectedUser.id, selectedUser.userName);
    if (result) {
      executeQuery({ requestPolicy: "network-only" });
    }
  }

  if (fetching) return <p>chargement...</p>;
  if (error)
    return (
      <Alert severity="error">
        <pre>{JSON.stringify(error, null, 2)}</pre>
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
        <strong>
          {selectedUser?.userName} ({selectedUser?.email})
        </strong>
        <Stack direction="row" spacing={2} mt={4} justifyContent="end">
          <Button variant="outlined" onClick={close}>
            Annuler
          </Button>
          <Button variant="contained" onClick={onClickDeleteUser}>
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
            <TableCell align="center">Actif</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(({ id, role, name, email, createdAt, isActive }: any) => (
            <TableRow key={id}>
              <TableCell align="center">
                <Badge variant={role === "super" ? "standard" : "dot"}>
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
                <MenuButton variant="contained">
                  <MenuItem onClick={() => confirmDeleteUser(id, email, name)}>
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
