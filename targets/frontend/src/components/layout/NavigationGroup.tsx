import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Badge,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import { NavigationItem, NavigationItemProps } from "./NavigationItem";
import { useRouter } from "next/router";

type NavigationGroupProps = {
  id: string;
  label: string;
  aggregateCount?: number;
  expanded: boolean;
  onExpand: (id: string) => void;
  items?: NavigationItemProps[];
};

export function NavigationGroup({
  id,
  label,
  expanded,
  onExpand,
  aggregateCount,
  items = [],
}: NavigationGroupProps) {
  const router = useRouter();
  if (items.some(({ href }) => href === router.asPath)) {
    expanded = true;
  }
  return (
    <Accordion expanded={expanded} onChange={() => onExpand(id)} disableGutters>
      <AccordionHeader
        aria-controls="panel1d-content"
        id="panel1d-header"
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography>{label}</Typography>
          <Badge
            badgeContent={aggregateCount}
            color="error"
            invisible={!aggregateCount}
          />
        </Stack>
      </AccordionHeader>
      <AccordionDetails>
        {items.map((props) => (
          <NavigationItem key={props.label} {...props}></NavigationItem>
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

const AccordionHeader = styled(AccordionSummary)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));
