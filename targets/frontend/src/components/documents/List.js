import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import PropTypes from "prop-types";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { useSelectionContext } from "src/pages/contenus";
import { theme } from "src/theme";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

export function DocumentList({ documents }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell sx={{ textAlign: "left" }}>Document</TableCell>
          <TableCell sx={{ textAlign: "left" }}>Publié</TableCell>
          <TableCell sx={{ textAlign: "left" }}>Disponible</TableCell>
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
        <input
          name={cdtnId}
          onChange={updatePublishedRef}
          defaultChecked={
            // eslint-disable-next-line no-prototype-builtins
            selectedItems.hasOwnProperty(cdtnId) ? !isPublished : isPublished
          }
          sx={checkboxStyles}
          type="checkbox"
        />
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
        {isPublished ? (
          <Box sx={{ color: "muted" }}>
            <IoIosCheckmark />
          </Box>
        ) : (
          <Box sx={{ color: "critical" }}>
            <IoIosClose />
          </Box>
        )}
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {isAvailable ? (
          <Box sx={{ color: "muted" }}>
            <IoIosCheckmark />
          </Box>
        ) : (
          <Box sx={{ color: "critical" }}>
            <IoIosClose />
          </Box>
        )}
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

const checkboxStyles = {
  cursor: "pointer",
  display: "block",
  m: "0 0 0 small",
  padding: 0,
};
