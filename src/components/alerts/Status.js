/** @jsx jsx */

import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { MenuButton, MenuItem } from "../button";
import { jsx } from "theme-ui";
import PropTypes from "prop-types";
import { useMutation } from "urql";

export const alertMutation = `
mutation updateAlertStatus($id:uuid!, $status:String!) {
  update_alerts_by_pk(
    pk_columns: {
      id: $id
    }
    _set: { status: $status }
  ){
    __typename
  }
}
`;

export function AlertStatus({ alertId }) {
  const [, executeUpdate] = useMutation(alertMutation);
  function updateStatus(status) {
    console.log("update statys", alertId, status);
    executeUpdate({ id: alertId, status });
  }
  return (
    <MenuButton variant="secondary">
      <MenuItem onSelect={() => updateStatus("doing")}>
        <span sx={{ display: "inline-block", width: "1.5em" }} />
        En cours
      </MenuItem>
      <MenuItem onSelect={() => updateStatus("done")}>
        <IoIosCheckmark style={{ width: "1.5em", height: "1.5em" }} /> Traité
      </MenuItem>
      <MenuItem onSelect={() => updateStatus("rejected")}>
        <IoIosClose style={{ width: "1.5em", height: "1.5em" }} /> Rejeté
      </MenuItem>
    </MenuButton>
  );
}
AlertStatus.propTypes = {
  alertId: PropTypes.string.isRequired,
};
