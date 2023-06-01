import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DescriptionIcon from "@mui/icons-material/Description";
import EditNoteIcon from "@mui/icons-material/EditNote";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const statusesMapping = {
  PUBLISHED: {
    color: "#2e7858",
    icon: <TaskAltIcon titleAccess="Publié" fontSize="small" />,
    text: "PUBLIÉ",
  },
  REDACTED: {
    color: "#c3992a",
    icon: <DescriptionIcon titleAccess="Rédigé" fontSize="small" />,
    text: "RÉDIGÉ",
  },
  REDACTING: {
    color: "#a9c8fb",
    icon: <EditNoteIcon titleAccess="En rédaction" fontSize="small" />,
    text: "RÉDACTION",
  },
  TODO: {
    color: "#a94645",
    icon: <ClearIcon titleAccess="À traiter" fontSize="small" />,
    text: "À TRAITER",
  },
  VALIDATED: {
    color: "#68a532",
    icon: <CheckIcon titleAccess="Validé" fontSize="small" />,
    text: "VALIDÉ",
  },
  VALIDATING: {
    color: "#e4794a",
    icon: (
      <VisibilityIcon titleAccess="En cours de validation" fontSize="small" />
    ),
    text: "VALIDATION",
  },
};
