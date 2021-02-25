/** @jsxImportSource theme-ui */
import { ErrorMessage } from "@hookform/error-message";
import { generateCdtnId } from "@shared/id-generator";
import { format } from "@shared/sheet-sp-formater";
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useCallback, useMemo, useReducer, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { IoMdAdd, IoMdCheckmark, IoMdClose } from "react-icons/io";
import { Button, IconButton } from "src/components/button";
import { Box, Field, Flex, Label, NavLink } from "theme-ui";
import { useMutation, useQuery } from "urql";

// order is important, the higher priority comes first
const sheetTypes = ["particuliers", "professionnels", "associations"];

const insertDocumentsMutation = `
mutation insert_documents($documents: [documents_insert_input!]!) {
  documents: insert_documents(objects: $documents,  on_conflict: {
    constraint: documents_pkey,
    update_columns: [title, source, slug, text, document, is_available, is_searchable]
  }) {
   returning {cdtn_id}
  }
}
`;

const getSheetIdsQuery = `
query sheetSP {
  sheetIds: documents(where: {source: {_eq: "${SOURCES.SHEET_SP}"}}) {
    initialId: initial_id
  }
}
`;

const SheetSPForm = () => {
  const [result] = useQuery({
    query: getSheetIdsQuery,
  });
  const { data: { sheetIds = [] } = {} } = result;
  const existingSheetId = useMemo(
    () => sheetIds.map(({ initialId }) => initialId),
    [sheetIds]
  );

  const fieldArrayName = "sheetIds";
  const {
    control,
    register,
    handleSubmit,
    errors,
    setError,
    reset: resetForm,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      [fieldArrayName]: [{ id: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    keyName: "key",
    name: fieldArrayName,
  });

  const hasError = Object.keys(errors).length > 0;

  const [status, dispatch] = useReducer(reducer, []);
  const [isProcessing, setProcessing] = useState(false);
  const [displayStatus, setDisplayStatus] = useState(false);

  const onSubmit = useCallback(
    async ({ sheetIds }) => {
      const providedIds = sheetIds.map(({ id }) => id.toUpperCase());
      let hasError = false;

      for (const [index, id] of providedIds.entries()) {
        if (existingSheetId.includes(id)) {
          setError(`${fieldArrayName}[${index}].id`, {
            message: "Cette fiche est déjà présente !",
            type: "'text",
          });
          hasError = true;
        }
        if (providedIds.filter((providedId) => providedId === id).length > 1) {
          setError(`${fieldArrayName}[${index}].id`, {
            message: "Vous essayez d’ajouter deux fois la même fiche !",
            type: "'text",
          });
          hasError = true;
          break;
        }
      }
      if (hasError) return;

      dispatch({
        payload: providedIds.map((id) => ({
          id,
          status: "Recherche de la fiche...",
        })),
        type: "init",
      });
      setDisplayStatus(true);
      setProcessing(true);
      const sheetsToInsert = [];
      // la c’est sequentiel, l’idéal ce serait d’utiliser forEach plutôt
      // et de se debrouiller avec un state pour enregistrer les resultats
      // sur un usecallback
      for (const id of providedIds) {
        // we could also check on jsdelivr CDN
        const responses = await Promise.all(
          sheetTypes.map((type) =>
            fetch(
              `https://unpkg.com/@socialgouv/fiches-vdd/data/${type}/${id}.json`
            )
          )
        );
        if (responses.every(({ status }) => status === 404)) {
          dispatch({
            payload: { id, status: "Fiche introuvable" },
            type: "setStatus",
          });
        } else if (
          responses.some(({ status }) => status !== 404 && status >= 400)
        ) {
          dispatch({
            payload: {
              id,
              status:
                "Une erreur est survenue pendant le chargement de la fiche.",
            },
            type: "setStatus",
          });
        } else {
          let response;
          // that’s why order is important
          for (const res of responses) {
            if (res.status !== 404) {
              response = res;
              break;
            }
          }
          const rawSheet = await response.json();
          console.log(rawSheet);
          const formatedSheet = format(rawSheet, () => [], []);
          sheetsToInsert.push(formatedSheet);
          dispatch({
            payload: { id, status: "En attente d’enregistrement" },
            type: "setStatus",
          });
        }
      }
      for (const sheet of sheetsToInsert) {
        // const toInsert = {
        //   ...formatedFiche,
        //   cdtn_id: generateCdtnId(`${source}${id}`),
        //   initial_id: id,
        //   is_available: true,
        //   is_searchable: true,
        //   meta_description: document.description || "",
        // };
        dispatch({
          payload: { id: sheet.id, status: "Enregistrée" },
          type: "setStatus",
        });
      }
      setProcessing(false);
    },
    [existingSheetId, setError]
  );

  if (displayStatus) {
    return (
      <>
        {isProcessing && <>Processing...</>}
        <br />
        {status.map(({ id, status }) => (
          <div key={id}>
            {id} : {status}
          </div>
        ))}
        {!isProcessing && (
          <Flex sx={{ alignItems: "center" }}>
            <Link href={"/contenus?source=fiches_service_public"} passHref>
              <NavLink mr="medium">Retour à la liste</NavLink>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                dispatch({ type: "reset" });
                setDisplayStatus(false);
              }}
            >
              Retour au formulaire
            </Button>
          </Flex>
        )}
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <>
        <Label>{`Renseignez l’identifiant ${
          fields.length > 1 ? "des" : "de la"
        } fiche${fields.length > 1 ? "s" : ""} à ajouter`}</Label>
        {fields.map((field, index) => (
          <Box sx={{ my: "small" }} key={field.key}>
            <Flex sx={{ alignItems: "center" }}>
              <Field
                sx={{ width: "10rem" }}
                name={`${fieldArrayName}[${index}].id`}
                defaultValue=""
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
                      height: "iconMedium",
                      width: "iconMedium",
                    }}
                  />
                </IconButton>
              )}
              {index === fields.length - 1 && (
                <Button
                  size="small"
                  variant="secondary"
                  type="button"
                  sx={{ flex: "0 0 auto", ml: "xxlarge" }}
                  onClick={() => append({ id: "" })}
                >
                  <IoMdAdd
                    sx={{
                      height: "iconSmall",
                      mr: "xxsmall",
                      width: "iconSmall",
                    }}
                  />
                  Renseigner une fiche supplémentaire
                </Button>
              )}
            </Flex>
            <ErrorMessage
              errors={errors}
              name={`${fieldArrayName}[${index}].id`}
              render={({ message }) => <Box color="critical">{message}</Box>}
            />
          </Box>
        ))}

        <Flex mt="medium" sx={{ alignItems: "center" }}>
          <Button variant="secondary" disabled={hasError || !isDirty}>
            {isDirty && !hasError && (
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
          <Link href={"/contenus?source=fiches_service_public"} passHref>
            <NavLink ml="medium">Retour à la liste</NavLink>
          </Link>
        </Flex>
      </>
    </form>
  );
};

SheetSPForm.propTypes = {};

export { SheetSPForm };

function reducer(state, action) {
  let idIndex;
  switch (action.type) {
    case "init":
      return [...action.payload];
    case "setStatus":
      idIndex = state.findIndex(({ id }) => id === action.payload.id);
      if (idIndex !== -1) {
        return [
          ...state.slice(0, idIndex),
          { id: action.payload.id, status: action.payload.status },
          ...state.slice(idIndex + 1),
        ];
      }
      return state;
    case "reset":
      return [];
    default:
      throw new Error();
  }
}
