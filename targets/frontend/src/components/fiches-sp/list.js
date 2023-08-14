import PropTypes from "prop-types";
import { useContext } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { SelectionContext } from "src/pages/contenus/fiches-sp";
import { InputLabel as Label } from "@mui/icons-material";
import { theme } from "src/theme";

export function ServicPublicList({ items }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th sx={{ width: "2.5rem" }} />
          <Th align="left">id</Th>
          <Th align="left">status</Th>
        </tr>
      </thead>
      {items.map((item) => (
        <ServicePublicItemRow key={item.id} item={item} />
      ))}
    </Table>
  );
}

function ServicePublicItemRow({ item }) {
  const { selectedItems, setSelectedItems } = useContext(SelectionContext);

  function updateSelection(event) {
    if (event.target.checked) {
      setSelectedItems(selectedItems.concat(item.id));
    } else {
      setSelectedItems(selectedItems.filter((id) => item.id !== id));
    }
  }
  return (
    <Tr>
      <Td>
        <input
          type="checkbox"
          defaultChecked={selectedItems.includes(item.id)}
          onChange={updateSelection}
          id={`row-${item.id}`}
        />
      </Td>
      <Td>
        <Label htmlFor={`row-${item.id}`} sx={{ cursor: "pointer" }}>
          {item.id}
        </Label>
      </Td>
      <Td>{getStatus(item)}</Td>
    </Tr>
  );
}

function getStatus({ status, cdtn_id, is_available, is_published }) {
  if (status === "unknow") {
    return <p sx={{ color: theme.colors.danger }}>fiche inconnue</p>;
  }
  if (cdtn_id === null) {
    if (status === "unknown") {
      return <p sx={{ color: theme.colors.critical }}>la fiche n’existe pas</p>;
    }
    return <p sx={{ color: theme.colors.muted }}>En attente de traitement</p>;
  }
  if (is_available) {
    if (is_published) {
      return (
        <p sx={{ color: "positive" }}>
          <IoMdCheckmarkCircleOutline
            aria-label="la fiche est disponible"
            title="La fiche est disponible"
          />
        </p>
      );
    }
    return <p sx={{ color: theme.colors.muted }}>dépubliée</p>;
  }
  return <p style={{ color: theme.colors.critical }}>supprimée </p>;
}

const Table = (props) => <table css={styles.table} {...props} />;
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
  table: {
    borderCollapse: "collapse",
    borderRadius: "small",
    overflow: "hidden",
    width: "100%",
  },
  td: {
    fontWeight: 300,
    px: "xsmall",
    py: "xxsmall",
    "tr:nth-of-type(even) &": {
      bg: "highlight",
    },
  },
  th: {
    borderBottom: "1px solid",
    fontSize: "medium",
    // bg: "info",
    // color: "white",
    fontWeight: "semibold",

    px: "xsmall",

    py: "xsmall",
  },
};
