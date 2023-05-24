import { ReactElement } from "react";
import { Control } from "react-hook-form";
import { KaliReference } from "../../type";
import { useSearchKaliReferenceQuery } from "./KaliReferencesSearch.query";
import { ReferenceInput } from "./ReferenceInput";

type Props = {
  name: string;
  idcc: string;
  control: Control<any>;
};

export const KaliReferenceInput = ({
  name,
  idcc,
  control,
}: Props): ReactElement | null => {
  return (
    <ReferenceInput<KaliReference>
      label={`Références liées à la convention collective ${idcc}`}
      color="secondary"
      name={name}
      control={control}
      fetcher={useSearchKaliReferenceQuery(idcc)}
      isEqual={(option, value) => value.id === option.id}
      getLabel={(item) => item.path}
      onClick={(item) => {
        const newWindow = window.open(
          `https://www.legifrance.gouv.fr/conv_coll/id/${item.id}/?idConteneur=KALICONT000005635550`,
          "_blank",
          "noopener,noreferrer"
        );
        if (newWindow) newWindow.opener = null;
      }}
    />
  );
};
