import { Flex } from "theme-ui";

import { ContentPicker } from "../forms/ContentPicker";

export type SectionContentProps = {
  control: any;
  errors: any[];
  register: any;
  name: string;
};

export const SectionContent = ({
  control,
  errors,
  register,
  name,
}: SectionContentProps) => {
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
