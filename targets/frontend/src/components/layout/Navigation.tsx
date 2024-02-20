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
    contents: {
      order: 2,
      label: "Contenus",
      links: [
        { href: "/contenus", label: "Contenus" },
        { href: "/contributions", label: "Contributions" },
        { href: "/agreements", label: "Convention collectives" },
        { href: "/mises-a-jour", label: "Mises à jour" },
        { href: "/models", label: "Modèles de document" },
        { href: "/informations", label: "Pages informations" },
        { href: "/fichiers", label: "Fichiers" },
      ],
    },
    other: {
      order: 3,
      label: "Autre contenu",
      links: [
        { href: "/contenus?source=highlights", label: "À la une" },
        { href: "/kali/blocks", label: "Blocs KALI" },
        { href: "/contenus/fiches-sp", label: "Fiches service-public" },
        { href: "/glossary", label: "Glossaire" },
        {
          href: "/contenus?source=prequalified",
          label: "Requetes pré-qualifiées",
        },
        { href: "/themes", label: "Thèmes" },
      ],
    },
    check: {
      order: 4,
      label: "Vérification",
      links: [
        {
          href: "/unthemed",
          label: "Contenus sans thème",
        },
        {
          href: "/duplicates",
          label: "Élements en Doublons",
        },
        {
          href: "/ghost-documents",
          label: "Références inaccessibles",
        },
      ],
    },
    system: {
      order: 5,
      label: "Systèmes",
      links: [{ href: "/users", label: "Gestion des utilisateurs" }],
    },
  };
  if (navAggregation) {
    navigation.alerts = {
      order: 1,
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
