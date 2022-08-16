import { useFormContext, useWatch } from "react-hook-form";
import { Label, Textarea } from "theme-ui";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { MarkdownLink } from "../MarkdownLink";
import { MarkdownPreviewModal } from "./MarkdownPreviewModal";

export type SectionTextProps = {
  name: string;
};

export const SectionText = ({ name }: SectionTextProps) => {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  const markdown = useWatch({
    control,
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
            validate: {
              required: (value) => {
                const typeValue = getValues(`${name}.type`);
                if (!value && typeValue !== "content") {
                  return "Ce champ est requis";
                }
                return true;
              },
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="markdown" />
        {markdown && <MarkdownPreviewModal markdown={markdown} />}
      </div>
    </>
  );
};
