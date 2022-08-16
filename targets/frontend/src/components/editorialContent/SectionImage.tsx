import { useFormContext } from "react-hook-form";
import { Field } from "theme-ui";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { SectionText } from "./SectionText";

export type SectionImageProps = {
  name: string;
};

export const SectionImage = ({ name }: SectionImageProps) => {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <div>
        <Field
          label="Lien de l’image"
          {...register(`${name}.imgUrl`, {
            validate: {
              required: (value) => {
                const typeValue = getValues(`${name}.type`);
                if (!value && typeValue !== "graphic") {
                  return "L’url de l’image est requise";
                }
                return true;
              },
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="imgUrl" />
      </div>
      <div>
        <Field
          label="Brève description de l’image"
          {...register(`${name}.altText`, {
            validate: {
              required: (value) => {
                const typeValue = getValues(`${name}.type`);
                if (!value && typeValue !== "graphic") {
                  return "La brève description de l’image est requise";
                }
                return true;
              },
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="altText" />
      </div>
      <div>
        <Field
          label="Lien du pdf"
          {...register(`${name}.fileUrl`, {
            validate: {
              required: (value) => {
                const typeValue = getValues(`${name}.type`);
                if (!value && typeValue !== "graphic") {
                  return "L’url du pdf est requise";
                }
                return true;
              },
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="fileUrl" />
      </div>
      <div>
        <Field
          label="Taille du pdf"
          {...register(`${name}.size`, {
            validate: {
              required: (value) => {
                const typeValue = getValues(`${name}.type`);
                if (!value && typeValue !== "graphic") {
                  return "La taille du pdf est requise";
                }
                return true;
              },
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="size" />
      </div>
      <SectionText name={name} />
    </>
  );
};
