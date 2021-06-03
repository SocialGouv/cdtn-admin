/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import { useFieldArray } from "react-hook-form";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Stack } from "src/components/layout/Stack";
import { Container, Flex, Label, Radio } from "theme-ui";

import { References } from "./References";

const JURIDIQUES_LABEL = "Références juridiques";
const USEFUL_LINKS_LABEL = "Liens utiles";

export function ReferenceBlocks({ control, name, register, errors }) {
  const { fields: blocks, append, remove } = useFieldArray({
    control,
    keyName: "key",
    name,
  });

  return (
    <>
      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <Container
            key={block.key}
            bg="nested"
            sx={{ borderRadius: "large", flex: "1 0 auto", p: "small" }}
          >
            <Stack>
              <Flex sx={{ justifyContent: "flex-end" }}>
                <Button
                  type="button"
                  size="small"
                  outline
                  onClick={() => remove(index)}
                >
                  <IoMdTrash
                    sx={{
                      height: "iconSmall",
                      mr: "xsmall",
                      width: "iconSmall",
                    }}
                  />
                  Supprimer ce bloc de références
                </Button>
              </Flex>
              <div>
                <Flex sx={{ justifyContent: "flex-start" }}>
                  <Label
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      flex: "0 1 auto",
                      justifyContent: "flex-start",
                      mr: "large",
                      width: "auto",
                    }}
                  >
                    {JURIDIQUES_LABEL}
                    <Radio
                      sx={{ ml: "xxsmall" }}
                      value={JURIDIQUES_LABEL}
                      {...register(`${name}.${index}.label`, {
                        required: {
                          message: "Il faut choisir un type de références",
                          value: true,
                        },
                      })}
                      defaultChecked={block.label === JURIDIQUES_LABEL}
                    />
                  </Label>
                  <Label
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      flex: "0 1 auto",
                      justifyContent: "flex-center",
                      width: "auto",
                    }}
                  >
                    {USEFUL_LINKS_LABEL}
                    <Radio
                      sx={{ ml: "xxsmall" }}
                      value={USEFUL_LINKS_LABEL}
                      {...register(`${name}.${index}.label`, {
                        required: {
                          message: "Il faut choisir un type de références",
                          value: true,
                        },
                      })}
                      defaultChecked={block.label === USEFUL_LINKS_LABEL}
                    />
                  </Label>
                </Flex>
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
            </Stack>
          </Container>
        ))
      ) : (
        <Button
          type="button"
          size="small"
          variant="secondary"
          outline
          onClick={() => {
            append({ label: JURIDIQUES_LABEL });
          }}
        >
          <IoMdAdd
            sx={{
              height: "iconSmall",
              mr: "xsmall",
              width: "iconSmall",
            }}
          />
          Ajouter ici un bloc de références
        </Button>
      )}
    </>
  );
}

ReferenceBlocks.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  name: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
};
