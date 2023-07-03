import { List } from "@mui/material";
import { useNavigationAggregation } from "./NavigationAggregation.query";
import { slugifyRepository } from "src/models";
import { NavigationItem } from "./NavigationItem";
import { NavigationGroup } from "./NavigationGroup";
import { useState } from "react";

export function Navigation() {
  const badges = useNavigationAggregation();
  const [expanded, setExpanded] = useState<string | false>();
  return (
    <List>
      <NavigationItem href="/users" label="Gestion des utilisateurs" />
      <NavigationGroup
        id="alerts"
        label="Alertes"
        expanded={expanded === "alerts"}
        onExpand={setExpanded}
        aggregateCount={badges?.reduce(
          (sum, { aggregateCount }) => sum + aggregateCount,
          0
        )}
        items={badges?.map(({ label, repository, aggregateCount }) => ({
          label,
          href: `/alerts/${slugifyRepository(repository)}`,
          aggregateCount,
        }))}
      />
      <NavigationGroup
        id="contents"
        label="Contenus"
        expanded={expanded === "contents"}
        onExpand={setExpanded}
        items={[
          {
            href: "/contenus",
            label: "Contenus",
          },
          {
            href: "/contenus?source=information",
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
        ]}
      />
      {/* <NavigationItem href="/contenus" label="Contenus" />
        <NavigationItem
          href="/contenus?source=information"
          label="Contenus éditoriaux"
        />
        <NavigationItem href="/contenus?source=highlights" label="À la une" />
        <NavigationItem
          href="/contenus?source=prequalified"
          label="Requetes pré-qualifiées"
        />
        <NavigationItem href="/glossary" label="Glossaire" />
        <NavigationItem href="/themes" label="Thèmes" />
        <NavigationItem href="/kali/blocks" label="Blocs KALI" />
        <NavigationItem href="/fichiers" label="Fichiers" />
        <NavigationItem href="/unthemed" label="Contenus sans thème" />
        <NavigationItem
          href="/contenus/fiches-sp"
          label="fiches service-public"
        />
        <NavigationItem href="/duplicates" label="Élements en Doublons" />
        <NavigationItem
          href="/ghost-documents"
          label="Références inaccessibles"
        />
        <NavigationItem href="/mises-a-jour" label="Mises à jour" /> */}
      <NavigationGroup
        id="contributions"
        label="Contributions"
        expanded={expanded === "contributions"}
        onExpand={setExpanded}
        items={[{ href: "/contributions", label: "Questions" }]}
      />
      {/* <NavigationItem href="/contributions" label="Questions " /> */}
    </List>
  );
}
