import { SourceKeys, getRouteBySource } from "@socialgouv/cdtn-utils";
import { Control } from "react-hook-form";
import { Document } from "../../type";
import { ReferenceInput } from "./ReferenceInput";
import { useFicheSpSearchCdtnReferencesQuery } from "./ficheSpReferenceSearch.query";

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

export const FicheSpDocumentInput = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => (
  <ReferenceInput<Document>
    label={`Fiche service-public`}
    color="info"
    name={name}
    disabled={disabled}
    control={control}
    fetcher={useFicheSpSearchCdtnReferencesQuery}
    isEqual={(option, value) => value.cdtnId === option.cdtnId}
    getLabel={(item) => `${item.title} (${item.slug})`}
    onClick={(item) => {
      const newWindow = window.open(
        `https://code.travail.gouv.fr/${getRouteBySource(
          item.source as SourceKeys
        )}/${item.slug}`,
        "_blank",
        "noopener,noreferrer"
      );
      if (newWindow) newWindow.opener = null;
    }}
  />
);
