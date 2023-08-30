import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdCheckmark, IoMdClipboard } from "react-icons/io";
import { theme } from "../../theme";

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
          <IoMdCheckmark style={iconSx} /> Copié !
        </>
      ) : (
        <>
          <IoMdClipboard style={iconSx} />
          Copier
        </>
      )}
    </Button>
  ) : null;
};

const iconSx = {
  height: theme.sizes.iconSmall,
  marginRight: theme.space.xxsmall,
  width: theme.sizes.iconSmall,
};

CopyButton.propTypes = {
  copied: PropTypes.bool,
  onClip: PropTypes.func,
  text: PropTypes.string.isRequired,
};
