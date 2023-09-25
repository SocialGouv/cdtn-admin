import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import PropTypes from "prop-types";
import { useSelectionContext } from "src/pages/contenus";
import { theme } from "src/theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Check, Cross } from "../utils/icons";

export function DocumentList({ documents }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell sx={{ textAlign: "left" }}>Document</TableCell>
          <TableCell sx={{ textAlign: "center" }}>Publié</TableCell>
          <TableCell sx={{ textAlign: "center" }}>Disponible</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map((doc) => (
          <DocumentRow key={doc.cdtnId} document={doc} />
        ))}
      </TableBody>
    </Table>
  );
}

DocumentList.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      cdtnId: PropTypes.string.isRequired,
      isAvailable: PropTypes.bool.isRequired,
      isPublished: PropTypes.bool.isRequired,
      source: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const DocumentRow = function DocumentRow({
  document: { cdtnId, source, title, isPublished, isAvailable },
}) {
  const [selectedItems, setSelectedItems] = useSelectionContext();
  const updatePublishedRef = () => {
    // eslint-disable-next-line no-prototype-builtins
    if (selectedItems.hasOwnProperty(cdtnId)) {
      delete selectedItems[cdtnId];
      setSelectedItems({ ...selectedItems });
    } else {
      setSelectedItems({ ...selectedItems, [cdtnId]: !isPublished });
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div class="fr-checkbox-group">
          <input
            name={cdtnId}
            onChange={updatePublishedRef}
            checked={
              selectedItems.hasOwnProperty(cdtnId) ? !isPublished : isPublished
            }
            type="checkbox"
            aria-describedby="checkbox-messages"
            id={`row-${cdtnId}`}
          />
          <label className="fr-label" htmlFor={`row-${cdtnId}`} />
          <div
            className="fr-messages-group"
            id="checkbox-messages"
            aria-live="polite"
          ></div>
        </div>
      </TableCell>
      <TableCell>
        <Link
          href={sourceToRoute({ cdtnId, source })}
          passHref
          shallow
          style={{ textDecoration: "none" }}
        >
          <span
            sx={{
              color: isPublished ? theme.colors.link : theme.colors.muted,
              textDecoration: isAvailable ? "none" : " line-through",
            }}
          >
            {source} › {title}
          </span>
        </Link>
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {isPublished ? <Check /> : <Cross />}
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {isAvailable ? <Check /> : <Cross />}
      </TableCell>
    </TableRow>
  );
};

DocumentRow.propTypes = {
  document: PropTypes.shape({
    cdtnId: PropTypes.string.isRequired,
    isAvailable: PropTypes.bool.isRequired,
    isPublished: PropTypes.bool.isRequired,
    source: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

export const sourceToRoute = ({ cdtnId, source }) => {
  switch (source) {
    case SOURCES.THEMES:
      return `/themes/edit/${cdtnId}`;
    case SOURCES.EDITORIAL_CONTENT:
    case SOURCES.HIGHLIGHTS:
    case SOURCES.PREQUALIFIED:
      return `/contenus/edit/${cdtnId}`;
    default:
      return `/contenus/${cdtnId}`;
  }
};
