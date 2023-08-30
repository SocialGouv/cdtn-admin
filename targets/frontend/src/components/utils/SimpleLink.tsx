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
    <Link
      target={target}
      href={href}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {children}
    </Link>
  );
};
