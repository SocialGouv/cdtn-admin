import { useFormContext } from "react-hook-form";
import { Flex } from "theme-ui";

import { ContentPicker } from "../forms/ContentPicker";

export type SectionContentProps = {
  name: string;
};

export const SectionContent = ({ name }: SectionContentProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <>
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
