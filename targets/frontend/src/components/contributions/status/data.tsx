import { fr } from "@codegouvfr/react-dsfr";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const statusesMapping = {
  TODO: {
    color: fr.colors.decisions.text.default.error.default,
    icon: <ClearIcon titleAccess="À traiter" fontSize="small" />,
    text: "À TRAITER",
  },

  REDACTING: {
    color: fr.colors.decisions.text.actionHigh.blueCumulus.default,
    icon: <EditNoteIcon titleAccess="En rédaction" fontSize="small" />,
    text: "RÉDACTION",
  },
  REDACTED: {
    color: fr.colors.decisions.text.default.info.default,
    icon: <DescriptionIcon titleAccess="Rédigé" fontSize="small" />,
    text: "RÉDIGÉ",
  },
  VALIDATING: {
    color: fr.colors.decisions.text.actionHigh.orangeTerreBattue.default,
    icon: (
      <VisibilityIcon titleAccess="En cours de validation" fontSize="small" />
    ),
    text: "EN VALIDATION",
  },
  VALIDATED: {
    color: fr.colors.decisions.text.default.warning.default,
    icon: <CheckIcon titleAccess="Validé" fontSize="small" />,
    text: "VALIDÉ",
  },

  PUBLISHED: {
    color: fr.colors.decisions.text.default.success.default,
    icon: <TaskAltIcon titleAccess="Publié" fontSize="small" />,
    text: "PUBLIÉ",
  },
};
