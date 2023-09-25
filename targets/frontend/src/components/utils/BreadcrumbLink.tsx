import { Typography } from "@mui/material";
import Link from "next/link";

import { styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";

export const Breadcrumb = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element => (
  <StyledBreadcrumbs
    aria-label="breadcrumb"
    sx={{ marginBottom: "30px" }}
    separator=">"
  >
    {children}
  </StyledBreadcrumbs>
);

const StyledBreadcrumbs = styled(Breadcrumbs)(() => {
  return {
    "ol > li::marker": {
      content: '""',
    },
  };
});

export const BreadcrumbLink = ({
  href,
  children,
  target,
}: {
  href?: string;
  children: JSX.Element | JSX.Element[] | string | undefined;
  target?: string;
}): JSX.Element => {
  return (
    <>
      {href ? (
        <Link target={target} href={href}>
          {children}
        </Link>
      ) : (
        <Typography aria-current="page">{children}</Typography>
      )}
    </>
  );
};
