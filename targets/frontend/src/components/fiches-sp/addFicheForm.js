import { ErrorMessage } from "@hookform/error-message";
import { useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { Box, Field, Flex, Heading, Text } from "theme-ui";
import { useQuery } from "urql";

import { Button, IconButton } from "../button";

export function AddFicheSpForm({ onAdd }) {
  const [result] = useQuery({
    query: `query ids {
      ids: service_public_contents { id }
    }`,
  });
  const { data: { ids = [] } = {} } = result;
  const existingIds = useMemo(() => ids.map(({ id }) => id), [ids]);

  const {
    control,
    register,
    handleSubmit,
    errors,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      items: [{ id: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    keyName: "key",
    name: "items",
  });
  const handleKeyDown = (event) => {
    // 13 is the keyCode for "enter"
    if (event.keyCode === 13) {
      event.preventDefault();
      append({ id: "" });
    }
  };
  function onSubmit({ items }) {
    const uniqueIds = [...new Set(items.map(({ id }) => id.toUpperCase()))];
    const filteredIds = uniqueIds.filter((id) => !existingIds.includes(id));
    onAdd(filteredIds);
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Heading as="h3" sx={{ fontSize: "large", fontWeight: "600" }}>
        Ajouter des fiches
      </Heading>
      <Text>{`Renseignez l’identifiant ${
        fields.length > 1 ? "des" : "de la"
      } fiche${fields.length > 1 ? "s" : ""} à ajouter`}</Text>
      {fields.map((field, index) => {
        return (
          <Box sx={{ my: "small" }} key={field.key}>
            <Flex sx={{ alignItems: "center" }}>
              <Field
                sx={{ width: "10rem" }}
                name={`items[${index}].id`}
                defaultValue=""
                onKeyDown={handleKeyDown}
                ref={register({
                  pattern: {
                    message: `Seuls les identifiants de fiche sont acceptés (ils commencent
              par un F, suivi de chiffres exclusivement).`,
                    value: /^f\d{1,6}$/i,
                  },
                  required: "Vous n’avez pas renseigné l’identifiant",
                })}
              />{" "}
              {fields.length > 1 && (
                <IconButton
                  sx={{ flex: "0 0 auto", ml: "xxsmall", padding: "small" }}
                  type="button"
                  variant="secondary"
                  onClick={() => remove(index)}
                >
                  <IoMdClose
                    sx={{
                      flex: "1 0 auto",
                      height: "iconsXSmall",
                      width: "iconsXSmall",
                    }}
                  />
                </IconButton>
              )}
              {index === fields.length - 1 && (
                <Button
                  size="small"
                  variant="secondary"
                  outline
                  type="button"
                  sx={{ flex: "0 0 auto", ml: "xxlarge" }}
                  onClick={() => append({ id: "" })}
                >
                  Saisir une fiche supplémentaire
                </Button>
              )}
            </Flex>
            <ErrorMessage
              errors={errors}
              name={`items[${index}].id`}
              render={({ message }) => <Box color="critical">{message}</Box>}
            />
          </Box>
        );
      })}
      <Box>
        <Button
          variant="primary"
          disabled={Object.keys(errors).length > 0 || !isDirty}
        >
          {isDirty && Object.keys(errors).length === 0 && (
            <IoMdCheckmark
              sx={{
                height: "iconSmall",
                mr: "xsmall",
                width: "iconSmall",
              }}
            />
          )}
          {`Ajouter ${fields.length > 1 ? "les" : "la"} fiche${
            fields.length > 1 ? "s" : ""
          }`}
        </Button>
      </Box>
    </form>
  );
}
