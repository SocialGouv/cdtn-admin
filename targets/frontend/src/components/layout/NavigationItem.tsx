import Link from "next/link";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Badge,
} from "@mui/material";

export type NavigationItemProps = {
  href: string;
  label: string;
  aggregateCount?: number;
};

export function NavigationItem({
  href,
  label,
  aggregateCount,
}: NavigationItemProps) {
  return (
    <ListItem
      disablePadding
      component={Link}
      href={href}
      style={{ textDecoration: "none" }}
    >
      <ListItemButton>
        <ListItemText
          primary={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <div style={{ color: "rgb(62, 72, 110)" }}>{label}</div>
              <Badge
                badgeContent={aggregateCount}
                color="error"
                invisible={!aggregateCount}
              />
            </Stack>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}
