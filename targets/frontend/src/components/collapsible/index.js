import { Button } from "../button";

import React, { useState } from "react";
import { IoMdGitNetwork } from "react-icons/io";

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
