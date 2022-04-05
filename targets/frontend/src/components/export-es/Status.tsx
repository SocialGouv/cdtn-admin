/** @jsxImportSource theme-ui */

import { Status as StatusType } from "@shared/types";
import { MdTimelapse } from "react-icons/md";
import { Box, Flex } from "theme-ui";

type StatusProps = {
  status?: StatusType;
};

export function Status({ status }: StatusProps): JSX.Element {
  if (!status) {
    return (
      <Flex sx={{ alignItems: "center" }}>
        <span>En cours</span> <MdTimelapse sx={{ mb: "-.3rem", ml: ".4rem" }} />
      </Flex>
    );
  }
  switch (status) {
    case StatusType.completed:
      return (
        <Box as="span" color="positive">
          Succès
        </Box>
      );
    case StatusType.timeout:
      return (
        <Box as="span" color="muted">
          Timeout
        </Box>
      );
    case StatusType.running:
      return (
        <Flex sx={{ alignItems: "center" }}>
          <span>En cours</span>{" "}
          <MdTimelapse sx={{ mb: "-.2rem", ml: ".3rem" }} />
        </Flex>
      );
    case StatusType.failed:
      return (
        <Box as="span" color="critical">
          Erreur
        </Box>
      );
    default:
      return <Box as="span">{status}</Box>;
  }
}
