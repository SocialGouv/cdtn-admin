import PropTypes from "prop-types";

import { DilaChanges } from "./DilaChanges";
import { FicheTravailDataChanges } from "./FicheTravailDataChanges";
import { FicheVddChanges } from "./FicheVddChanges";

export function DiffChange({ change, type }) {
  switch (type) {
    case "dila":
      return <DilaChanges change={change} />;
    case "vdd":
      return <FicheVddChanges change={change} />;
    case "travail-data":
      return <FicheTravailDataChanges change={change} />;
  }
  return null;
}

DiffChange.propTypes = {
  change: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};
