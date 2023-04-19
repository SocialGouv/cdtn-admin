/** @jsxImportSource theme-ui */

import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdCheckmark, IoMdClipboard } from "react-icons/io";

export const CopyButton = ({
  onClip,
  copied: optionalCopiedProp = false,
  text,
  ...props
}) => {
  const [copied, setCopied] = useState(optionalCopiedProp);
  const [hasClipboardApi, setHasClipboardApi] = useState(false);
  useEffect(() => {
    setCopied(optionalCopiedProp);
  }, [optionalCopiedProp, setCopied]);
  useEffect(() => {
    setHasClipboardApi(Boolean(navigator?.clipboard));
  }, [setHasClipboardApi]);

  return hasClipboardApi ? (
    <Button
      {...props}
      disabled={copied}
      onClick={(evt) => {
        evt.preventDefault();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          if (onClip) {
            onClip(text);
          }
        });
      }}
    >
      {copied ? (
        <>
          <IoMdCheckmark sx={iconSx} /> Copié !
        </>
      ) : (
        <>
          <IoMdClipboard sx={iconSx} />
          Copier
        </>
      )}
    </Button>
  ) : null;
};

const iconSx = {
  height: "iconSmall",
  mr: "xxsmall",
  width: "iconSmall",
};

CopyButton.propTypes = {
  copied: PropTypes.bool,
  onClip: PropTypes.func,
  text: PropTypes.string.isRequired,
};
