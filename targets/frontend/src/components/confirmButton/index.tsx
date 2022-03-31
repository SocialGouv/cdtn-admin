import PropTypes from "prop-types";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { Button as BaseButton } from "theme-ui";

const buttonPropTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
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

export const ConfirmButton = React.forwardRef(function _ConfirmButton(
  { variant = "primary", size = "normal", children, onClick, ...props }: any,
  ref
) {
  const [needConfirm, setNeedConfirm] = useState(false);

  const onClickCustom = (event: any) => {
    if (!needConfirm) {
      setNeedConfirm(true);
    } else {
      setNeedConfirm(false);
      onClick(event);
    }
  };
  const cancel = (event: any) => {
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
          bg: (theme: any) => theme.buttons[variant].bgHover,
          borderColor: (theme: any) => theme.buttons[variant].bgHover,
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
        },
        bg: (theme: any) => theme.buttons[variant].bg,
        borderColor: (theme: any) => theme.buttons[variant].bg,
        borderRadius: "small",
        color: (theme: any) => theme.buttons[variant].color,
      }}
      onClick={onClickCustom}
    >
      {needConfirm ? (
        <>
          Vraiment ? <MdClose onClick={cancel} />
        </>
      ) : (
        children
      )}
    </BaseButton>
  );
});
ConfirmButton.propTypes = {
  ...buttonPropTypes,
};
