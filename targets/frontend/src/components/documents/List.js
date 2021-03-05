/** @jsxImportSource theme-ui */

import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import PropTypes from "prop-types";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { useSelectionContext } from "src/pages/contenus";
import { theme } from "src/theme";
import { Box, NavLink } from "theme-ui";

/**
 * documents is a list of document to display
 *
 * onSearchUpdate is a callback to inform parent component that
 * search criteria have changed
 *
 * onUpdatePublication is a callback that receive the entries
 * to update
 *
 * updatePublishDoc is a map that will hold modified
 * documents publication status and thier cdtnId, persisting
 * through pagination navigation to allow the user to select
 * items through multiple pages.
 *
 * In order to do this we use react-hook-form (RHF) register
 * and register / set default value by hand, each time the component render
 * We also add / register previous changed item so our form is "dirty"
 * to control the button disable props.
 *
 * The updatePublishDoc is cleared, by the upper component (DocumentList)
 * when navigation change or when update is done.
 *
 */
export function DocumentList({ documents }) {
  return (
    <table>
      <thead>
        <tr>
          <th />
          <th sx={{ textAlign: "left" }}>Document</th>
          <th sx={{ textAlign: "left" }}>Publié</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <DocumentRow key={doc.cdtnId} document={doc} />
        ))}
      </tbody>
    </table>
  );
}
DocumentList.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      cdtnId: PropTypes.string.isRequired,
      isPublished: PropTypes.bool.isRequired,
      source: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const DocumentRow = function DocumentRow({
  document: { cdtnId, source, title, isPublished },
}) {
  const [selectedItems, setSelectedItems] = useSelectionContext();
  const updatePublishedRef = (event) => {
    console.log("updatePublishedRef", cdtnId, event.target.checked);
    // eslint-disable-next-line no-prototype-builtins
    if (selectedItems.hasOwnProperty(cdtnId)) {
      delete selectedItems[cdtnId];
      console.log("delete", { ...selectedItems });
      setSelectedItems({ ...selectedItems });
    } else {
      setSelectedItems({ ...selectedItems, [cdtnId]: !isPublished });
    }
  };

  return (
    <tr>
      <td>
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
      </td>
      <td>
        <Link href={sourceToRoute({ cdtnId, source })} passHref shallow>
          <NavLink>
            <span
              sx={{
                color: isPublished ? theme.colors.link : theme.colors.muted,
              }}
            >
              {source} › {title}
            </span>
          </NavLink>
        </Link>
      </td>
      <td sx={{ textAlign: "center" }}>
        {isPublished ? (
          <Box sx={{ color: "muted" }}>
            <IoIosCheckmark />
          </Box>
        ) : (
          <Box sx={{ color: "critical" }}>
            <IoIosClose />
          </Box>
        )}
      </td>
    </tr>
  );
};

DocumentRow.propTypes = {
  document: PropTypes.shape({
    cdtnId: PropTypes.string.isRequired,
    isPublished: PropTypes.bool.isRequired,
    source: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
};

const sourceToRoute = ({ cdtnId, source }) => {
  switch (source) {
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
