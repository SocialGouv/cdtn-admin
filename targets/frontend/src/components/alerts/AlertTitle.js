/** @jsx jsx */

import PropTypes from "prop-types";
import { Box, Flex, jsx } from "theme-ui";

import { AlertStatus } from "./Status";

export function AlertTitle({ alertId, ...props }) {
  return (
    <Flex sx={{ alignItems: "center", my: "large" }}>
      <AlertStatus alertId={alertId} />
      <Box as="h2" sx={{ flex: "1 1 auto" }} {...props} />
    </Flex>
  );
}

AlertTitle.propTypes = {
  alertId: PropTypes.string.isRequired,
};
