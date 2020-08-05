import PropTypes from "prop-types";
import React, { useState } from "react";
import { IoMdGitNetwork } from "react-icons/io";

import { Button } from "../button";

export function Collapsible({ label, children, ...props }) {
  const [isVisible, setVisible] = useState(false);
  return (
    <div {...props}>
      <Button variant="link" onClick={() => setVisible(!isVisible)}>
        <IoMdGitNetwork /> {label}
      </Button>
      {isVisible && children}
    </div>
  );
}

Collapsible.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
};
