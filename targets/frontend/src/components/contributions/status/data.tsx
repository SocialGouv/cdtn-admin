import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fr } from "@codegouvfr/react-dsfr";

export type StatusesMapping = {
  [status: string]: {
    color: string;
    icon: any;
    text: string;
  };
};

export const statusesMapping: StatusesMapping = {
  TODO: {
    color: fr.colors.decisions.text.default.error.default,
    icon: <ClearIcon titleAccess="À traiter" fontSize="small" />,
    text: "À traiter",
  },

  REDACTING: {
    color: fr.colors.decisions.text.actionHigh.blueCumulus.default,
    icon: <EditNoteIcon titleAccess="En rédaction" fontSize="small" />,
    text: "En rédaction",
  },
  REDACTED: {
    color: fr.colors.decisions.text.default.info.default,
    icon: <DescriptionIcon titleAccess="Rédigé" fontSize="small" />,
    text: "À validé",
  },
  VALIDATING: {
    color: fr.colors.decisions.text.default.warning.default,
    icon: (
      <VisibilityIcon titleAccess="En cours de validation" fontSize="small" />
    ),
    text: "En validation",
  },
  VALIDATED: {
    color: fr.colors.decisions.text.label.greenBourgeon.default,
    icon: <CheckIcon titleAccess="Validé" fontSize="small" />,
    text: "Validé",
  },

  PUBLISHED: {
    color: fr.colors.decisions.text.default.success.default,
    icon: <TaskAltIcon titleAccess="Publié" fontSize="small" />,
    text: "Publié",
  },
};
