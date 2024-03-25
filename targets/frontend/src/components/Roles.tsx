import { useQuery } from "urql";
import { FixedSnackBar } from "./utils/SnackBar";
import React from "react";
import { Chip } from "@mui/material";

export const getRoleQuery = `
query getRoles{
  roles {
    role
  }
}
`;

export function Roles() {
  const [results] = useQuery({ query: getRoleQuery });
  const { data, error, fetching } = results;

  if (fetching) return <p>loading</p>;
  if (error)
    return (
      <FixedSnackBar>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </FixedSnackBar>
    );
  return (
    <p>
      {data.roles.map((role: string) => (
        <Chip color="success" key={role} label={role} />
      ))}
    </p>
  );
}
