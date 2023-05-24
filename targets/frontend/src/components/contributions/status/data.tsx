import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import DescriptionIcon from "@mui/icons-material/Description";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";

export const statusesMapping = {
  PUBLISHED: { color: "purple", icon: <SaveIcon />, text: "PUBLIÉ" },
  REDACTED: { color: "blue", icon: <DescriptionIcon />, text: "RÉDIGÉ" },
  REDACTING: {
    color: "turquoise",
    icon: <ModeEditIcon />,
    text: "RÉDACTION",
  },
  TODO: { color: "red", icon: <ClearIcon />, text: "À TRAITER" },
  VALIDATED: { color: "green", icon: <CheckIcon />, text: "VALIDÉ" },
  VALIDATING: {
    color: "orange",
    icon: <VisibilityIcon />,
    text: "VALIDATION",
  },
};
