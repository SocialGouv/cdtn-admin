import { getRouteBySource, SourceKeys } from "@socialgouv/cdtn-utils";
import { Control } from "react-hook-form";
import { CdtnReference } from "./type";
import { useSearchCdtnReferencesQuery } from "./cdtnReferencesSearch.query";
import { FormAutocompleteChips } from "../AutocompleteChips";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
  onReorder?: (oldIndex: number, newIndex: number) => void;
};

export const FormCdtnReferences = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => (
  <FormAutocompleteChips<CdtnReference>
    isMultiple={true}
    label={`Contenus liés`}
    color="info"
    name={name}
    disabled={disabled}
    control={control}
    fetcher={useSearchCdtnReferencesQuery}
    isEqual={(option, value) =>
      value.document.cdtnId === option.document.cdtnId
    }
    getLabel={(item) =>
      `${getRouteBySource(item.document.source as SourceKeys)} > ${
        item.document.title
      } (${item.document.slug})`
    }
    onClick={(item) => {
      const newWindow = window.open(
        `https://code.travail.gouv.fr/${getRouteBySource(
          item.document.source as SourceKeys
        )}/${item.document.slug}`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
