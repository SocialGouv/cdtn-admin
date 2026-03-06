import { fr } from "@codegouvfr/react-dsfr";
import { Check as CheckIcon, Clear as ClearIcon } from "./dsfrIcons";
export const Check = ({ text }: { text?: string }): JSX.Element => {
  return (
    <CheckIcon
      titleAccess={text}
      fontSize="small"
      color={fr.colors.decisions.background.flat.success.default}
    />
  );
};
export const Cross = ({ text }: { text?: string }): JSX.Element => {
  return (
    <ClearIcon
      titleAccess={text}
      fontSize="small"
      color={fr.colors.decisions.background.flat.error.default}
    />
  );
};
