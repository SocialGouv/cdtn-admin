import { AccordionItem, AccordionPanel } from "@reach/accordion";
import PropTypes from "prop-types";
import React from "react";
import { AccordionButton } from "src/components/button";

export const ChangesGroup = ({ changes, label, renderChange }) => {
  return changes && changes.length > 0 ? (
    <AccordionItem>
      <AccordionButton>{label}</AccordionButton>
      <AccordionPanel>
        <ul>{changes.map(renderChange)}</ul>
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
