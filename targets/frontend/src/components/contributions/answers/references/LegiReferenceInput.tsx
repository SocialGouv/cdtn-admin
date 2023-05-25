import { Control } from "react-hook-form";
import { LegiReference } from "../../type";
import { useContributionSearchLegiReferenceQuery } from "./LegiReferencesSearch.query";
import { ReferenceInput } from "./ReferenceInput";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

export const LegiReferenceInput = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => (
  <ReferenceInput<LegiReference>
    label={`Références liées au code du travail`}
    color="success"
    name={name}
    disabled={disabled}
    control={control}
    fetcher={useContributionSearchLegiReferenceQuery}
    isEqual={(option, value) => value.id === option.id}
    getLabel={(item) => item.index}
    onClick={(item) => {
      const newWindow = window.open(
        `https://www.legifrance.gouv.fr/codes/article_lc/${item.id}`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
