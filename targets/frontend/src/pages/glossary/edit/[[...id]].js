/** @jsx jsx  */
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Lister } from "src/components/forms/Lister";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useUser } from "src/hooks/useUser";
import { Field, Flex, jsx, Label, NavLink, Spinner, Textarea } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getTermQuery = `
query getTerm($id: uuid!) {
  term: glossary_by_pk(id: $id) {
    id
    abbreviations
    definition
    references
    term
    variants
  }
}
`;

const editTermMutation = `
mutation EditTerm(
  $term: glossary_insert_input!
) {
  insert_glossary_one(
    object: $term,
    on_conflict: {
      constraint: glossary_pkey,
      update_columns: [
        abbreviations,
        definition,
        references,
        term,
        variants
      ]
    }
  ){
    id
  }
}
`;

const deleteTermMutation = `
mutation DeleteTerm($id: uuid!) {
  delete_glossary_by_pk(id: $id) {
    id
  }
}
`;

export function EditTermPage() {
  const { isAdmin } = useUser();
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const termId = router.query.id && router.query.id[0];

  const [{ fetching, data: { term = {} } = {} }] = useQuery({
    pause: !termId,
    query: getTermQuery,
    requestPolicy: "network-only",
    variables: { id: termId },
  });
  const [deleteResult, deleteTerm] = useMutation(deleteTermMutation);

  function onDelete() {
    deleteTerm({ id: term.id }).then((result) => {
      if (!result.error) {
        router.push("/glossary");
      }
    });
  }

  const notFound = !fetching && termId && !term.id;

  let pageTitle = "Ajouter un terme";
  if (term.id) {
    pageTitle = isAdmin ? "Modifier" : "Consulter";
    pageTitle += " un terme";
  }

  return (
    <Layout errorCode={(notFound && 404) || null} title={pageTitle}>
      {fetching || deleteResult.fetching ? (
        <Spinner />
      ) : (
        <>
          {term.id && isAdmin && (
            <>
              <Dialog
                isOpen={showDeleteConfirmation}
                onDismiss={() => setShowDeleteConfirmation(false)}
                ariaLabel="Supprimer"
              >
                <>
                  <span>Êtes-vous sûr de vouloir supprimer ce terme ?</span>
                  <Inline>
                    <Button onClick={onDelete}>Confirmer</Button>
                    <Button
                      variant="link"
                      onClick={() => setShowDeleteConfirmation(false)}
                    >
                      Annuler
                    </Button>
                  </Inline>
                </>
              </Dialog>
              <div
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: "small",
                }}
              >
                <Button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmation(true);
                  }}
                >
                  <IoMdTrash
                    sx={{ height: "1.5rem", mr: "xsmall", width: "1.5rem" }}
                  />
                  Supprimer le terme
                </Button>
              </div>
            </>
          )}
          <TermForm term={term} />
        </>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditTermPage));

const TermForm = ({ term = {} }) => {
  const { isAdmin } = useUser();
  const router = useRouter();
  const { control, register, handleSubmit, errors } = useForm();
  const [editResult, editTerm] = useMutation(editTermMutation);
  const [duplicateTermError, setDuplicateTermError] = useState(false);

  async function onSubmit(data) {
    const result = await editTerm({
      term: {
        ...(term.id && { id: term.id }),
        ...data,
      },
    });
    if (!result.error) {
      router.push("/glossary");
    } else if (
      result.error.graphQLErrors[0].extensions.code === "constraint-violation"
    ) {
      setDuplicateTermError(true);
    }
  }

  const loading = editResult.fetching;
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer";
  if (term.id) {
    buttonLabel = "Enregistrer les changements";
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <>
        <div sx={{ mb: "small" }}>
          <Field
            disabled={!isAdmin}
            type="text"
            name="term"
            label="Terme"
            onChange={() => setDuplicateTermError(false)}
            defaultValue={term.term}
            ref={register({
              required: { message: "Ce champ est requis", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="term" />
          {duplicateTermError && (
            <div sx={{ color: "critical" }}>Ce terme existe déjà !</div>
          )}
        </div>

        <div sx={{ mb: "small" }}>
          <Label htmlFor={"definition"}>Définition</Label>
          <Textarea
            disabled={!isAdmin}
            name="definition"
            id="definition"
            rows={5}
            defaultValue={term.definition}
            ref={register({
              required: { message: "Ce champ est requis", value: true },
            })}
          />
        </div>

        <Flex
          sx={{
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "small",
            justifyContent: "stretch",
            mb: "small",
          }}
        >
          <div sx={{ flex: "1 1 auto" }}>
            <Label htmlFor={"variants"}>Variantes / Synonymes</Label>
            <Lister
              control={control}
              disabled={!isAdmin}
              name="variants"
              id="variants"
              defaultValue={term.variants}
            />
          </div>
          <div sx={{ flex: "1 1 auto" }}>
            <Label htmlFor={"abbreviations"}>Abréviations</Label>
            <Lister
              control={control}
              disabled={!isAdmin}
              name="abbreviations"
              id="abbreviations"
              defaultValue={term.abbreviations}
            />
          </div>
          <div sx={{ flex: "1 1 auto" }}>
            <Label htmlFor={"references"}>Références</Label>
            <Lister
              control={control}
              disabled={!isAdmin}
              name="references"
              id="references"
              defaultValue={term.references}
            />
          </div>
        </Flex>

        {isAdmin ? (
          <Flex sx={{ alignItems: "center", mt: "medium" }}>
            <Button variant="secondary" disabled={hasError || loading}>
              {buttonLabel}
            </Button>
            <Link href="/glossary" passHref>
              <NavLink sx={{ ml: "medium" }}>Annuler</NavLink>
            </Link>
          </Flex>
        ) : (
          <Link href="/glossary" passHref>
            <Button as="a" variant="secondary" sx={{ display: "inline-block" }}>
              Retour à la liste
            </Button>
          </Link>
        )}
      </>
    </form>
  );
};

TermForm.propTypes = {
  term: PropTypes.object,
};
