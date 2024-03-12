import { List, Stack, styled } from "@mui/material";
import { useNavigationAggregation } from "./NavigationAggregation.query";
import { slugifyRepository } from "src/models";
import { NavigationGroup } from "./NavigationGroup";
import { useState } from "react";
import { useRouter } from "next/router";
import { NavigationItem } from "./NavigationItem";

type NavigationScheme = {
  [key: string]: {
    order: number;
    label: string;
    links?: {
      href: string;
      label: string;
      aggregateCount?: number;
    }[];
    href?: string;
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
        { href: "/contenus", label: "Tous les contenus" },
        { href: "/contributions", label: "Contributions" },
        { href: "/agreements", label: "Convention collectives" },
        { href: "/fichiers", label: "Infographies" },
        { href: "/models", label: "Modèles de document" },
        { href: "/informations", label: "Pages informations" },
      ],
    },
    update: {
      order: 3,
      label: "Mises à jour",
      href: "/mises-a-jour",
    },
    other: {
      order: 4,
      label: "Autres contenus",
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
      order: 5,
      label: "Vérifications",
      links: [
        {
          href: "/unthemed",
          label: "Contenus sans thème",
        },
        {
          href: "/duplicates",
          label: "Élements en doublons",
        },
        {
          href: "/ghost-documents",
          label: "Références inaccessibles",
        },
      ],
    },
    system: {
      order: 6,
      label: "Gestion des utilisateurs",
      href: "/users",
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
      links?.some(({ href }) => {
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
        .map(([key, { label, links, href }]) => {
          return links ? (
            <NavigationGroup
              key={key}
              id={key}
              label={label}
              expanded={expanded === key}
              onExpand={setExpanded}
              aggregateCount={links.reduce(
                (sum, { aggregateCount }) => sum + (aggregateCount ?? 0),
                0
              )}
              items={links}
            />
          ) : (
            href && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Space />
                <NavigationItem
                  key={label}
                  label={label}
                  href={href}
                ></NavigationItem>
              </Stack>
            )
          );
        })}
    </List>
  );
}

const Space = styled("span")({
  padding: "11px",
});
