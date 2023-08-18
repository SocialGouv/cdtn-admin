import Link from "next/link";

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
    <li>
      {href ? (
        <Link target={target} href={href} className="fr-breadcrumb__link">
          {children}
        </Link>
      ) : (
        <a className="fr-breadcrumb__link" aria-current="page">
          {children}
        </a>
      )}
    </li>
  );
};
