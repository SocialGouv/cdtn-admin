import PropTypes from "prop-types";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { Button as BaseButton } from "@mui/material";

const buttonPropTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  size: PropTypes.oneOf(["small", "normal"]),
  variant: PropTypes.oneOf(["contained", "outlined", "text"]),
};

export const ConfirmButton = React.forwardRef(function _ConfirmButton(
  { size = "normal", children, onClick, ...props }: any,
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
    <BaseButton {...props} ref={ref} onClick={onClickCustom}>
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
