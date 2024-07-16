import { useFieldArray, useFormContext } from "react-hook-form";
import { IoMdAdd, IoMdTrash } from "react-icons/io";

import { ContentSectionReference } from "../../types";
import { Button } from "../button";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { References } from "./References";
import { FormRadioGroup } from "../forms";
import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import { theme } from "src/theme";

const JURIDIQUES_LABEL = "Références juridiques";
const USEFUL_LINKS_LABEL = "Liens utiles";

export function ReferenceBlocks({ name }: any) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    keyName: "key",
    name,
  });

  const blocks = fields as ContentSectionReference[];

  return (
    <>
      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <Card key={block.key} style={{ backgroundColor: "#f2f5fa" }}>
            <CardContent>
              <Box
                sx={{
                  display: "inline-flex",
                  justifyContent: "flex-end",
                  width: "100%",
                  mb: "1rem",
                }}
              >
                <Button
                  type="button"
                  size="small"
                  outline
                  onClick={() => remove(index)}
                >
                  <IoMdTrash
                    style={{
                      height: theme.sizes.iconSmall,
                      marginRight: theme.space.xsmall,
                      width: theme.sizes.iconSmall,
                    }}
                  />
                  Supprimer ce bloc de références
                </Button>
              </Box>
              <div>
                <FormRadioGroup
                  name={`${name}.${index}.label`}
                  label="Références"
                  control={control}
                  options={[
                    {
                      label: JURIDIQUES_LABEL,
                      value: JURIDIQUES_LABEL,
                    },
                    {
                      label: USEFUL_LINKS_LABEL,
                      value: USEFUL_LINKS_LABEL,
                    },
                  ]}
                />

                <FormErrorMessage
                  errors={errors}
                  fieldName={`${name}.${index}.label`}
                />
              </div>
              <References
                nestName={`${name}.${index}.links`}
                control={control}
                register={register}
                errors={errors}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <Button
          type="button"
          size="small"
          outline
          onClick={() => {
            append({ label: JURIDIQUES_LABEL });
          }}
        >
          <IoMdAdd
            style={{
              height: theme.sizes.iconSmall,
              marginRight: theme.space.xsmall,
              width: theme.sizes.iconSmall,
            }}
          />
          Ajouter un bloc de références
        </Button>
      )}
    </>
  );
}
