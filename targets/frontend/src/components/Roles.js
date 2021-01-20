import { Badge, Message } from "theme-ui";
import { useQuery } from "urql";

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
      <Message>
        <pre>{JSON.stringify(error, 0, 2)}</pre>
      </Message>
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
