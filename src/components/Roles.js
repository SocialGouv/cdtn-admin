import React from "react";
import { useQuery } from "urql";
import { Alert, Badge } from "theme-ui";

const query = `
query getRoles{
  roles {
    role
  }
}
`;
export function Roles() {
  const [results] = useQuery({ query });
  const { data, error, fetching } = results;

  if (fetching) return <p>loading</p>;
  if (error)
    return (
      <Alert variant="warning">
        <pre>{JSON.stringify(error, 0, 2)}</pre>
      </Alert>
    );
  return (
    <p>
      {data.roles.map(({ role }) => (
        <Badge as="span" variant="dark" key={role}>
          {role}
        </Badge>
      ))}
    </p>
  );
}
