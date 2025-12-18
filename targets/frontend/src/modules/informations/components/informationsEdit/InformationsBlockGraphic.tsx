import { Box, FormControl, Stack } from "@mui/material";
import React from "react";
import { FormSelect } from "src/components/forms";
import { Control, useWatch } from "react-hook-form";
import { useListInfographicQuery } from "../../../infographics/components/List/list.query";
import Image from "next/image";
import { buildFilePathUrl } from "../../../../components/utils";

export type InformationBlockGraphicProps = {
  name: string;
  control: Control<any>;
};

export const InformationsBlockGraphic = ({
  name,
  control,
}: InformationBlockGraphicProps): JSX.Element => {
  const infographicList = useListInfographicQuery({ search: "" });

  const selectedInfographic = useWatch({
    name: `${name}.infographic_id`,
    control,
  });
  const currentSvg = infographicList.rows.find(
    (i) => i.id === selectedInfographic
  )?.svgFile?.url;
  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <FormControl>
          <FormSelect
            name={`${name}.infographic_id`}
            label={"Infographie"}
            control={control}
            options={infographicList.rows.map((item) => ({
              value: item.id!,
              label: item.title,
            }))}
            rules={{ required: true }}
          />
        </FormControl>
        {currentSvg && (
          <Box mt={1} display="flex" justifyContent="center">
            <Image
              width={0}
              height={0}
              src={`${buildFilePathUrl()}/${currentSvg}`}
              alt={"Preview de l'infographie"}
              sizes="100vw"
              style={{ width: "90%", height: "auto" }}
            />
          </Box>
        )}
      </Stack>
    </>
  );
};
