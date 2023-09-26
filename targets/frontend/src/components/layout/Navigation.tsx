import { List } from "@mui/material";
import { useNavigationAggregation } from "./NavigationAggregation.query";
import { slugifyRepository } from "src/models";
import { NavigationGroup } from "./NavigationGroup";
import { useState } from "react";
import { useRouter } from "next/router";

type NavigationScheme = {
  [key: string]: {
    order: number;
    label: string;
    links: {
      href: string;
      label: string;
      aggregateCount?: number;
    }[];
  };
};

export function Navigation() {
  const navAggregation = useNavigationAggregation();
  const [expanded, setExpanded] = useState<string | false>();
  const router = useRouter();

  const navigation: NavigationScheme = {
    system: {
      order: 1,
      label: "Systèmes",
      links: [{ href: "/users", label: "Gestion des utilisateurs" }],
    },
    contents: {
      order: 3,
      label: "Contenus",
      links: [
        {
          href: "/contenus",
          label: "Contenus",
        },
        {
          href: "/informations",
          label: "Contenus éditoriaux",
        },
        {
          href: "/contenus?source=highlights",
          label: "À la une",
        },
        {
          href: "/contenus?source=prequalified",
          label: "Requetes pré-qualifiées",
        },
        {
          href: "/glossary",
          label: "Glossaire",
        },
        {
          href: "/themes",
          label: "Thèmes",
        },
        {
          href: "/kali/blocks",
          label: "Blocs KALI",
        },
        {
          href: "/fichiers",
          label: "Fichiers",
        },
        {
          href: "/unthemed",
          label: "Contenus sans thème",
        },
        {
          href: "/contenus/fiches-sp",
          label: "fiches service-public",
        },
        {
          href: "/duplicates",
          label: "Élements en Doublons",
        },
        {
          href: "/ghost-documents",
          label: "Références inaccessibles",
        },
        {
          href: "/mises-a-jour",
          label: "Mises à jour",
        },
      ],
    },
    contributions: {
      order: 4,
      label: "Contributions",
      links: [{ href: "/contributions", label: "Questions" }],
    },
  };
  if (navAggregation) {
    navigation.alerts = {
      order: 2,
      label: "Alertes",
      links: navAggregation.map(({ label, repository, aggregateCount }) => ({
        label,
        href: `/alerts/${slugifyRepository(repository)}`,
        aggregateCount,
      })),
    };
  }

  Object.entries(navigation).forEach(([key, { links }]) => {
    if (
      !expanded &&
      links.some(({ href }) => {
        return router?.asPath?.includes(href);
      })
    ) {
      setExpanded(key);
    }
  });

  return (
    <List>
      {Object.entries(navigation)
        .sort(([, { order: orderA }], [, { order: orderB }]) =>
          orderA > orderB ? 1 : -1
        )
        .map(([key, { label, links }]) => {
          return (
            <NavigationGroup
              key={key}
              id={key}
              label={label}
              expanded={expanded === key}
              onExpand={setExpanded}
              aggregateCount={links?.reduce(
                (sum, { aggregateCount }) => sum + (aggregateCount ?? 0),
                0
              )}
              items={links}
            />
          );
        })}
    </List>
  );
}
