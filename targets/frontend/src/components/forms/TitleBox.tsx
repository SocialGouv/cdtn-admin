import { FormLabel, Box } from "@mui/material";
import { styled } from "@mui/system";
import { fr } from "@codegouvfr/react-dsfr";

export const TitleBox = ({
  title,
  focus = false,
  children,
  className,
  disabled,
  isError = false,
  htmlFor,
}: {
  title: string;
  focus?: boolean;
  children?: JSX.Element | JSX.Element[] | null;
  className?: string;
  disabled?: boolean;
  isError?: boolean;
  htmlFor?: string;
}): JSX.Element => {
  return (
    <>
      <StyledBox
        focus={disabled ? false : focus}
        isError={isError}
        className={className}
      >
        <StyledFormLabel
          isError={isError}
          focus={disabled ? false : focus}
          htmlFor={htmlFor}
        >
          {title}
        </StyledFormLabel>
        {children}
      </StyledBox>
    </>
  );
};

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "focus" && prop !== "isError",
})<{ focus?: boolean; isError?: boolean }>(({ focus, isError }) => {
  return {
    border: `1px solid ${fr.colors.decisions.text.default.info.default}`,
    borderRadius: "1px",
    padding: "12px",
    position: "relative",
    borderColor: focus
      ? fr.colors.decisions.text.default.info.default
      : isError
      ? fr.colors.decisions.text.default.error.default
      : fr.colors.decisions.text.default.grey.default,
  };
});

const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "focus" && prop !== "isError",
})<{ focus?: boolean; isError?: boolean }>(({ focus, isError }) => {
  return {
    position: "absolute",
    fontSize: "12px",
    backgroundColor: fr.colors.decisions.background.default.grey.default,
    borderRadius: "12px",
    padding: "0 4px",
    top: "-8px",
    left: "10px",
    color: focus
      ? fr.colors.decisions.text.default.info.default
      : isError
      ? fr.colors.decisions.text.default.error.default
      : fr.colors.decisions.text.default.grey.default,
  };
});
