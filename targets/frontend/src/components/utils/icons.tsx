import { fr } from "@codegouvfr/react-dsfr";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
export const Check = ({ text }: { text?: string }): JSX.Element => {
  return (
    <CheckIcon
      titleAccess={text}
      fontSize="small"
      sx={{
        color: fr.colors.decisions.background.flat.success.default,
      }}
    />
  );
};
export const Cross = ({ text }: { text?: string }): JSX.Element => {
  return (
    <ClearIcon
      titleAccess={text}
      fontSize="small"
      sx={{
        color: fr.colors.decisions.background.flat.error.default,
      }}
    />
  );
};
