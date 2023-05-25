import { Control } from "react-hook-form";
import { CdtnDocument } from "../../type";
import { useContributionSearchCdtnDocumentQuery } from "./CdtnDocumentsSearch.query";
import { ReferenceInput } from "./ReferenceInput";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

export const CdtnDocumentInput = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => (
  <ReferenceInput<CdtnDocument>
    label={`Contenus liés`}
    color="info"
    name={name}
    disabled={disabled}
    control={control}
    fetcher={useContributionSearchCdtnDocumentQuery}
    isEqual={(option, value) => value.cdtn_id === option.cdtn_id}
    getLabel={(item) => `${item.source} > ${item.title}`}
    onClick={(item) => {
      const newWindow = window.open(
        `https://code.travail.gouv.fr/${item.source}/${item.slug}`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
