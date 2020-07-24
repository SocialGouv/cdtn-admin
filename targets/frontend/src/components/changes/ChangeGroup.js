import React from "react";
import PropTypes from "prop-types";
import { AccordionButton } from "src/components/button";
import { AccordionItem, AccordionPanel } from "@reach/accordion";

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
  label: PropTypes.string.isRequired,
  renderChange: PropTypes.func.isRequired,
  changes: PropTypes.arrayOf(
    PropTypes.shape({
      added: PropTypes.object,
      removed: PropTypes.object,
      modified: PropTypes.object,
    })
  ),
};
