import {
  Check as CheckIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  EditNote as EditNoteIcon,
  Visibility as VisibilityIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  TaskAlt as TaskAltIcon,
} from "../../utils/dsfrIcons";
import { fr } from "@codegouvfr/react-dsfr";

export type StatusesMapping = {
  [status: string]: {
    color: string;
    icon: JSX.Element;
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
    text: "À valider",
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
  TO_PUBLISH: {
    color: fr.colors.decisions.text.default.success.default,
    icon: <TaskAltIcon titleAccess="Publié" fontSize="small" />,
    text: "Publié",
  },
  PUBLISHING: {
    color: fr.colors.decisions.text.default.warning.default,
    icon: <TaskAltIcon titleAccess="Publié" fontSize="small" />,
    text: "À publier",
  },
  PUBLISHED: {
    color: fr.colors.decisions.text.default.success.default,
    icon: <CloudDoneIcon titleAccess="Publié" fontSize="small" />,
    text: "Publié",
  },
  NOT_PUBLISHED: {
    color: fr.colors.decisions.text.default.error.default,
    icon: <CloudOffIcon titleAccess="Publié" fontSize="small" />,
    text: "Non Publié",
  },
};
