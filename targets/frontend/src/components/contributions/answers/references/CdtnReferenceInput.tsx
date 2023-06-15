import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { Control } from "react-hook-form";
import { CdtnReference } from "../../type";
import { useContributionSearchCdtnReferencesQuery } from "./cdtnReferencesSearch.query";
import { ReferenceInput } from "./ReferenceInput";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

export const CdtnReferenceInput = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => (
  <ReferenceInput<CdtnReference>
    label={`Contenus liés`}
    color="info"
    name={name}
    disabled={disabled}
    control={control}
    fetcher={useContributionSearchCdtnReferencesQuery}
    isEqual={(option, value) => value.cdtn_id === option.cdtn_id}
    getLabel={(item) =>
      `${getRouteBySource(item.source)} > ${item.title} (${item.slug})`
    }
    onClick={(item) => {
      const newWindow = window.open(
        `https://code.travail.gouv.fr/${getRouteBySource(item.source)}/${
          item.slug
        }`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
