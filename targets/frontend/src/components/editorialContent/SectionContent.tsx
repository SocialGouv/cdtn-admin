import { useFormContext } from "react-hook-form";
import { Box, Flex, Label, Radio } from "theme-ui";

import { ContentPicker } from "../forms/ContentPicker";

export type SectionContentProps = {
  name: string;
};

export const SectionContent = ({ name }: SectionContentProps) => {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Box mb="small">
        <Label htmlFor={"intro"}>Affichage des sections&nbsp;</Label>
        <Label>
          <Radio
            {...register(`${name}.blockDisplayMode`)}
            name={`${name}.blockDisplayMode`}
            value={"line"}
            defaultChecked={!getValues(`${name}.blockDisplayMode`)}
          />
          Ligne
        </Label>
        <Label>
          <Radio
            {...register(`${name}.blockDisplayMode`)}
            name={`${name}.blockDisplayMode`}
            value={"square"}
          />
          Carré
        </Label>
      </Box>
      <Flex
        sx={{
          flexDirection: "column",
          mt: "small",
        }}
      >
        <ContentPicker
          defaultValue={[]}
          disabled={false}
          control={control}
          errors={errors}
          register={register}
          name={`${name}.contents`}
          id="contents"
          full={true}
        />
      </Flex>
    </>
  );
};
