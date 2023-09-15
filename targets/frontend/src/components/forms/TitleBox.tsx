import { Box, FormLabel } from "@mui/material";
import { css } from "styled-components";
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

const StyledBox = styled(Box)`
  border: 1px solid #9e9e9e;
  border-radius: 6px;
  padding: 12px;
  position: relative;
  ${({ focus }: { focus: boolean }) => {
    if (focus) {
      return css`
        border-color: #1565c0;
      `;
    }
  }}
`;

const StyledFormLabel = styled(FormLabel)`
  position: absolute;
  font-size: 12px;
  background-color: white;
  border-radius: 6px;
  padding: 0 4px;
  top: -8px;
  left: 8px;
  ${({ focus }: { focus: boolean }) => {
    if (focus) {
      return css`
        color: #1565c0;
      `;
    }
  }}
`;
