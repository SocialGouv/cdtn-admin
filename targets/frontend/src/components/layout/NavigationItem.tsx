import {
  Badge,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";

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
  const router = useRouter();
  return (
    <ListItem disablePadding onClick={() => router.push(href)}>
      <ListItemButton selected={router.asPath?.includes(href)}>
        <ListItemText
          primary={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <span>{label}</span>
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
