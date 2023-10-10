import { SourceRoute, getRouteBySource } from "@socialgouv/cdtn-sources";
import { Control } from "react-hook-form";
import { CdtnReference } from "../../type";
import { useContributionSearchCdtnReferencesQuery } from "./cdtnReferencesSearch.query";
import { ReferenceInput } from "./ReferenceInput";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
  idcc?: string;
};

export const CdtnReferenceInput = ({
  name,
  control,
  disabled = false,
  idcc,
}: Props): React.ReactElement => (
  <ReferenceInput<CdtnReference>
    isMultiple={true}
    label={`Contenus liés`}
    color="info"
    name={name}
    disabled={disabled}
    control={control}
    fetcher={useContributionSearchCdtnReferencesQuery}
    idcc={idcc}
    isEqual={(option, value) =>
      value.document.cdtnId === option.document.cdtnId
    }
    getLabel={(item) =>
      `${getRouteBySource(item.document.source as SourceRoute)} > ${
        item.document.title
      } (${item.document.slug})`
    }
    onClick={(item) => {
      const newWindow = window.open(
        `https://code.travail.gouv.fr/${getRouteBySource(
          item.document.source as SourceRoute
        )}/${item.document.slug}`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
