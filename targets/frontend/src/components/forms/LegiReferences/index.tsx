import { Control } from "react-hook-form";
import { LegiReference } from "./type";
import { useContributionSearchLegiReferenceQuery } from "./legiReferencesSearch.query";
import { FormAutocompleteChips } from "../";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

export const FormLegiReferences = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => {
  return (
    <FormAutocompleteChips<LegiReference>
      isMultiple={true}
      label={`Références liées au code du travail`}
      color="success"
      name={name}
      disabled={disabled}
      control={control}
      fetcher={useContributionSearchLegiReferenceQuery}
      isEqual={(option, value) =>
        value.legiArticle.id === option.legiArticle.id
      }
      getLabel={(item) => item.legiArticle.label}
      onClick={(item) => {
        const newWindow = window.open(
          `https://www.legifrance.gouv.fr/codes/article_lc/${item.legiArticle.id}`,
          "_blank",
          "noopener,noreferrer"
        );
        if (newWindow) newWindow.opener = null;
      }}
    />
  );
};
