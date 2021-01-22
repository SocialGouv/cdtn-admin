import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoMdGitCompare } from "react-icons/io";

import { Button } from "../button";
import { Inline } from "../layout/Inline";

const COLLAPSIBLE_ID = 1;

export function Collapsible({ label, children, id, ...props }) {
  const [isVisible, setVisible] = useState(false);
  const collapsibleRef = useRef(COLLAPSIBLE_ID);
  if (!id) {
    id = `collapsible-component-${collapsibleRef.current++}`;
  }
  return (
    <div {...props}>
      <Button
        aria-controls={id}
        aria-expanded={isVisible}
        size="small"
        variant="link"
        onClick={() => setVisible(!isVisible)}
      >
        <Inline space="xxsmall">
          <IoMdGitCompare /> {label}
          {isVisible ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </Inline>
      </Button>
      <div id={id} tabIndex="-1" hidden={!isVisible}>
        {children}
      </div>
    </div>
  );
}

Collapsible.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  label: PropTypes.string,
};
