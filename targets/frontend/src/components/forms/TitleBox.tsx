import { Box, FormLabel } from "@mui/material";
import { styled } from "@mui/system";

export const TitleBox = ({
  title,
  focus = false,
  children,
  className,
  disabled,
}: {
  title: string;
  focus?: boolean;
  children?: JSX.Element | JSX.Element[] | null;
  className?: string;
  disabled?: boolean;
}): JSX.Element => {
  return (
    <>
      <StyledBox focus={disabled ? false : focus} className={className}>
        <StyledFormLabel focus={disabled ? false : focus}>
          {title}
        </StyledFormLabel>
        {children}
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "focus",
})<{ focus?: boolean }>(({ theme, focus }) => {
  return {
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: "1px",
    padding: "12px",
    position: "relative",
    borderColor: focus ? theme.palette.primary.main : undefined,
  };
});

const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "focus",
})<{ focus?: boolean }>(({ theme, focus }) => {
  return {
    position: "absolute",
    fontSize: "12px",
    backgroundColor: theme.palette.background.default,
    borderRadius: "12px",
    padding: "0 4px",
    top: "-8px",
    left: "10px",
    color: focus ? theme.palette.primary.main : theme.palette.text.default,
  };
});
