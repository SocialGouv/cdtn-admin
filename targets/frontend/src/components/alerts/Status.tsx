import PropTypes from "prop-types";
import { useMutation } from "urql";

import { MenuButton, MenuItem } from "../button";
import { Check, Cross } from "../utils/icons";

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

export function AlertStatus({ alertId }: { alertId: string }) {
  const [, executeUpdate] = useMutation(alertMutation);

  function updateStatus(status: string) {
    executeUpdate({ id: alertId, status });
  }

  return (
    <MenuButton>
      <MenuItem onClick={() => updateStatus("doing")}>
        <span style={{ display: "inline-block", width: "1.5em" }} />
        En cours
      </MenuItem>
      <MenuItem onClick={() => updateStatus("done")}>
        <Check /> Traité
      </MenuItem>
      <MenuItem onClick={() => updateStatus("rejected")}>
        <Cross /> Rejeté
      </MenuItem>
    </MenuButton>
  );
}

AlertStatus.propTypes = {
  alertId: PropTypes.string.isRequired,
};
