import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import type { Theme } from "src/theme";
import { Button as BaseButton, ThemeUICSSObject } from "theme-ui";

const defaultButtonStyles: ThemeUICSSObject = {
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
export interface ConfirmButtonProps
  extends React.ComponentPropsWithRef<"button"> {
  size?: "small" | "normal";
  variant?: "accent" | "secondary" | "primary" | "link";
}
export const ConfirmButton = React.forwardRef<
  HTMLButtonElement,
  ConfirmButtonProps
>(function _ConfirmButton(
  {
    variant = "primary",
    size = "normal",
    children,
    onClick,
    ...props
  }: ConfirmButtonProps,
  ref
) {
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
          bg: (theme: Theme) => theme.buttons[variant].bgHover,
          borderColor: (theme: Theme) => theme.buttons[variant].bgHover,
        },
        "&[disabled]": {
          bg: "muted",
          borderColor: "muted",
        },
        bg: (theme: Theme) => theme.buttons[variant].bg,
        borderColor: (theme: Theme) => theme.buttons[variant].bg,
        borderRadius: "small",
        color: (theme: Theme) => theme.buttons[variant].color,
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
