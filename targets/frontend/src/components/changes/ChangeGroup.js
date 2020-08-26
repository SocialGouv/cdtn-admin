/** @jsx jsx */
import { AccordionItem, AccordionPanel } from "@reach/accordion";
import PropTypes from "prop-types";
import { AccordionButton } from "src/components/button";
import { jsx } from "theme-ui";

import { List } from "../list";

export const ChangesGroup = ({ changes, label, renderChange }) => {
  return changes && changes.length > 0 ? (
    <AccordionItem>
      <AccordionButton>{label}</AccordionButton>
      <AccordionPanel>
        <List sx={{ px: "xsmall" }}>{changes.map(renderChange)}</List>
      </AccordionPanel>
    </AccordionItem>
  ) : null;
};

ChangesGroup.propTypes = {
  changes: PropTypes.arrayOf(
    PropTypes.shape({
      added: PropTypes.object,
      modified: PropTypes.object,
      removed: PropTypes.object,
    })
  ),
  label: PropTypes.string.isRequired,
  renderChange: PropTypes.func.isRequired,
};
