import styled from "styled-components";
import Link from "next/link";

export const SimpleLink = ({
  href,
  children,
  target,
}: {
  href: string;
  children: JSX.Element | JSX.Element[] | string | undefined;
  target?: string;
}): JSX.Element => {
  return (
    <StyledLink target={target} href={href}>
      {children}
    </StyledLink>
  );
};

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;
