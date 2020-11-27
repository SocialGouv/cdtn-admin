/** @jsx jsx */

import PropTypes from "prop-types";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { Button as BaseButton, jsx } from "theme-ui";

const buttonPropTypes = {
  size: PropTypes.oneOf(["small", "normal"]),
  variant: PropTypes.oneOf(["accent", "secondary", "primary", "link"]),
};

const defaultButtonStyles = {
  alignItems: "center",
  appearance: "none",
  borderRadius: "small",
  borderStyle: "solid",
  borderWidth: 2,
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "inherit",
  fontWeight: "bold",
  lineHeight: "inherit",
  m: 0,
  minWidth: 0,
  textAlign: "center",
  textDecoration: "none",
};
const normalSize = {
  px: "xsmall",
  py: "xsmall",
};
const smallSize = {
  px: "xxsmall",
  py: "xxsmall",
};

export const ConfirmButton = React.forwardRef(
  (
    { variant = "primary", size = "normal", children, onClick, ...props },
    ref
  ) => {
    const [needConfirm, setNeedConfirm] = useState(false);

    const onClickCustom = (event) => {
      if (!needConfirm) {
        setNeedConfirm(true);
      } else {
        setNeedConfirm(false);
        onClick(event);
      }
    };
    const cancel = (event) => {
      event.stopPropagation();
      setNeedConfirm(false);
    };
    return (
      <BaseButton
        {...props}
        ref={ref}
        sx={{
          ...defaultButtonStyles,
          ...(size === "small" ? smallSize : normalSize),
          "&:hover:not([disabled])": {
            bg: (theme) => theme.buttons[variant].bgHover,
            borderColor: (theme) => theme.buttons[variant].bgHover,
          },
          "&[disabled]": {
            bg: "muted",
            borderColor: "muted",
          },
          bg: (theme) => theme.buttons[variant].bg,
          borderColor: (theme) => theme.buttons[variant].bg,
          borderRadius: "small",
          color: (theme) => theme.buttons[variant].color,
        }}
        onClick={onClickCustom}
      >
        {needConfirm ? (
          <>
            Vraimment ? <MdClose onClick={cancel} />
          </>
        ) : (
          children
        )}
      </BaseButton>
    );
  }
);
ConfirmButton.propTypes = {
  ...buttonPropTypes,
};
