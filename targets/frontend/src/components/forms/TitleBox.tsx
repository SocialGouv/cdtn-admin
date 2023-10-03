import { Box, FormLabel } from "@mui/material";
import { styled } from "@mui/system";

export const TitleBox = ({
  title,
  focus = false,
  children,
  className,
  disabled,
  isError = false,
}: {
  title: string;
  focus?: boolean;
  children?: JSX.Element | JSX.Element[] | null;
  className?: string;
  disabled?: boolean;
  isError?: boolean;
}): JSX.Element => {
  return (
    <>
      <StyledBox
        focus={disabled ? false : focus}
        isError={isError}
        className={className}
      >
        <StyledFormLabel isError={isError} focus={disabled ? false : focus}>
          {title}
        </StyledFormLabel>
        {children}
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "focus" && prop !== "isError",
})<{ focus?: boolean; isError?: boolean }>(({ theme, focus, isError }) => {
  return {
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: "1px",
    padding: "12px",
    position: "relative",
    borderColor: focus
      ? theme.palette.primary.main
      : isError
      ? theme.palette.error.main
      : undefined,
  };
});

const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "focus" && prop !== "isError",
})<{ focus?: boolean; isError?: boolean }>(({ theme, focus, isError }) => {
  return {
    position: "absolute",
    fontSize: "12px",
    backgroundColor: theme.palette.background.default,
    borderRadius: "12px",
    padding: "0 4px",
    top: "-8px",
    left: "10px",
    color: focus
      ? theme.palette.primary.main
      : isError
      ? theme.palette.error.main
      : theme.palette.text.default,
  };
});
