/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { useMutation } from "urql";

import { MenuButton, MenuItem } from "../button";

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
    executeUpdate({ id: alertId, status });
  }
  return (
    <MenuButton variant="secondary">
      <MenuItem onSelect={() => updateStatus("doing")}>
        <span sx={{ display: "inline-block", width: "1.5em" }} />
        En cours
      </MenuItem>
      <MenuItem onSelect={() => updateStatus("done")}>
        <IoIosCheckmark style={{ height: "iconSmall", width: "iconSmall" }} />{" "}
        Traité
      </MenuItem>
      <MenuItem onSelect={() => updateStatus("rejected")}>
        <IoIosClose style={{ height: "iconSmall", width: "iconSmall" }} />{" "}
        Rejeté
      </MenuItem>
    </MenuButton>
  );
}
AlertStatus.propTypes = {
  alertId: PropTypes.string.isRequired,
};
