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
    isEqual={(option, value) =>
      value.document.cdtnId === option.document.cdtnId
    }
    getLabel={(item) =>
      `${getRouteBySource(item.document.source)} > ${item.document.title} (${
        item.document.slug
      })`
    }
    onClick={(item) => {
      const newWindow = window.open(
        `https://code.travail.gouv.fr/${getRouteBySource(
          item.document.source
        )}/${item.document.slug}`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
