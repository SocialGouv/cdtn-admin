/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import { useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Box, Field, Flex } from "theme-ui";

export const References = ({ control, nestName, register, errors }) => {
  const {
    fields: references,
    append,
    remove,
  } = useFieldArray({
    control,
    keyName: "key",
    name: nestName,
  });

  useEffect(() => {
    if (references.length === 0) {
      append({});
    }
  }, [references, append]);
  return (
    <>
      {references.map((reference, index) => (
        <Flex
          sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
          key={reference.key}
        >
          <Box mr="small" sx={{ flex: "1 0 auto" }}>
            <Field
              type="text"
              label="Label"
              defaultValue={reference.title}
              {...register(`${nestName}.${index}.title`, {
                required: {
                  message: "La référence doit avoir un label",
                  value: true,
                },
              })}
            />
            <FormErrorMessage
              errors={errors}
              fieldName={`${nestName}.${index}.title`}
            />
          </Box>
          <Box mr="small" sx={{ flex: "1 0 auto" }}>
            <Field
              type="text"
              label="URL"
              defaultValue={reference.url}
              {...register(`${nestName}.${index}.url`, {
                required: {
                  message: "La référence doit avoir une url",
                  value: true,
                },
              })}
            />
            <FormErrorMessage
              errors={errors}
              fieldName={`${nestName}.${index}.url`}
            />
          </Box>
          {references.length > 1 && (
            <Button
              type="button"
              variant="primary"
              outline
              onClick={() => remove(index)}
              sx={{ flex: "0 0 auto", mt: "medium" }}
            >
              <IoMdClose sx={{ height: "1.5rem", width: "1.5rem" }} />
            </Button>
          )}
        </Flex>
      ))}
      <Flex sx={{ justifyContent: "left" }}>
        <Button
          size="small"
          onClick={() => append({})}
          variant="secondary"
          outline
          type="button"
        >
          Ajouter une référence au bloc
        </Button>
      </Flex>
    </>
  );
};

References.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  nestName: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
};
