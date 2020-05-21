/** @jsx jsx */
import { useQuery } from "urql";
import { css, jsx, Badge } from "theme-ui";
import { IoIosCheckmark, IoMdCloseCircle, IoMdMore } from "react-icons/io";
import PropTypes from "prop-types";
import { IconButton } from "./button";

const query = `
query getUser {
  users {
    id
    email
    name
    active
    created_at
    default_role
    roles {
      role
    }
  }
}
`;

export function UserList() {
  const [result] = useQuery({
    query,
  });
  const { data, fetching, error } = result;
  if (fetching) return <p>chargement...</p>;
  if (error)
    return (
      <div className="alert alert-warning">
        <pre>{JSON.stringify(error, 0, 2)}</pre>
      </div>
    );

  return (
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
          ({ id, default_role, name, email, created_at, active }) => (
            <Tr key={id}>
              <Td align="center">
                <Badge
                  variant={default_role === "admin" ? "primary" : "secondary"}
                >
                  {default_role}
                </Badge>
              </Td>
              <Td>{name}</Td>
              <Td>{email}</Td>
              <Td>{new Date(created_at).toLocaleDateString("fr-FR")}</Td>
              <Td align="center">
                {active ? <IoIosCheckmark /> : <IoMdCloseCircle />}
              </Td>
              <Td align="center">
                <IconButton variant="secondary">
                  <IoMdMore />
                </IconButton>
              </Td>
            </Tr>
          )
        )}
      </tbody>
    </table>
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
  th: css({
    px: "xsmall",
    py: "xsmall",
    borderBottom: "1px solid",
    // bg: "info",
    // color: "white",
    fontWeight: "semibold",
    fontSize: "medium",
  }),
  td: css({
    px: "xsmall",
    py: "xxsmall",
    fontWeight: 300,
    "tr:nth-of-type(even) &": {
      bg: "highlight",
    },
  }),
};
