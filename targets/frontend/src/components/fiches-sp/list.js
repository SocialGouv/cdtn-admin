/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import { useContext } from "react";
import {
  IoMdCheckmarkCircleOutline,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import { SelectionContext } from "src/pages/contenus/fiches-sp";
import { css, Label, Text } from "theme-ui";

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
  const [selectedItems, setSelectedItems] = useContext(SelectionContext);

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
    return <Text sx={{ color: "danger" }}>fiche inconnue</Text>;
  }
  if (cdtn_id === null) {
    if (status === "unknown") {
      return (
        <Text sx={{ color: "critical" }}>
          fiche non trouvée{" "}
          <IoMdInformationCircleOutline
            title="La fiche n'existe pas"
            aria-label="La fiche n'existe pas"
          />
        </Text>
      );
    }
    return (
      <Text sx={{ color: "muted" }}>
        bientôt disponible{" "}
        <IoMdInformationCircleOutline
          title="La fiche n'a pas encore été importée"
          aria-label="La fiche n'a pas encore été importée"
        />
      </Text>
    );
  }
  if (is_available) {
    if (is_published) {
      return (
        <Text sx={{ color: "positive" }}>
          <IoMdCheckmarkCircleOutline
            aria-label="la fiche est disponible"
            title="La fiche est disponible"
          />
        </Text>
      );
    }
    return <Text sx={{ color: "muted" }}>dépubliée</Text>;
  }
  return (
    <Text sx={{ color: "critical" }}>
      supprimée{" "}
      <IoMdInformationCircleOutline
        title="La fiche n'existe plus."
        aria-label="La fiche n'existe plus"
      />
    </Text>
  );
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
