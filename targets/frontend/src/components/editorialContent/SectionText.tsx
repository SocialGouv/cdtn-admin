import { useWatch } from "react-hook-form";
import { Label, Textarea } from "theme-ui";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { MarkdownLink } from "../MarkdownLink";
import { MarkdownPreviewModal } from "./MarkdownPreviewModal";

export type SectionTextProps = {
  control: any;
  errors: any[];
  register: any;
  name: string;
};

export const SectionText = ({
  control,
  errors,
  register,
  name,
}: SectionTextProps) => {
  const markdown = useWatch({
    control,
    defaultValue: "",
    name: `${name}.markdown`,
  });
  return (
    <>
      <div>
        <Label htmlFor={"markdown"}>
          Texte&nbsp;
          <MarkdownLink />
        </Label>
        <Textarea
          id={`${name}.markdown`}
          rows={10}
          {...register(`${name}.markdown`, {
            required: {
              message: "Ce champ est requis",
              value: true,
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="markdown" />
        {markdown && <MarkdownPreviewModal markdown={markdown} />}
      </div>
    </>
  );
};
