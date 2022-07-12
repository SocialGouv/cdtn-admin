import { Field } from "theme-ui";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { SectionText } from "./SectionText";

export type SectionImageProps = {
  control: any;
  errors: any[];
  register: any;
  name: string;
};

export const SectionImage = ({
  control,
  errors,
  register,
  name,
}: SectionImageProps) => {
  return (
    <>
      <div>
        <Field
          label="Lien de l’image"
          {...register(`${name}.imgUrl`, {
            required: {
              message: "L’url de l’image est requise",
              value: true,
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="imgUrl" />
      </div>
      <div>
        <Field
          label="Brève description de l’image"
          {...register(`${name}.altText`, {
            required: {
              message: "La brève description de l’image est requise",
              value: true,
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="altText" />
      </div>
      <div>
        <Field
          label="Lien du pdf"
          {...register(`${name}.fileUrl`, {
            required: {
              message: "L’url du pdf est requise",
              value: true,
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="fileUrl" />
      </div>
      <div>
        <Field
          label="Taille du pdf"
          {...register(`${name}.size`, {
            required: {
              message: "La taille du pdf est requise",
              value: true,
            },
          })}
        />
        <FormErrorMessage errors={errors} fieldName="size" />
      </div>
      <SectionText
        errors={errors}
        register={register}
        name={name}
        control={control}
      />
    </>
  );
};
