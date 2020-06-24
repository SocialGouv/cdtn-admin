/** @jsx jsx */

import { jsx, Flex, Box } from "theme-ui";
import PropTypes from "prop-types";
import { AlertStatus } from "./Status";

export function AlertTitle({ alertId, ...props }) {
  return (
    <Flex sx={{ my: "large", alignItems: "center" }}>
      <AlertStatus alertId={alertId} />
      <Box as="h2" sx={{ flex: "1 1 auto" }} {...props} />
    </Flex>
  );
}

AlertTitle.propTypes = {
  alertId: PropTypes.string.isRequired,
};
