import { useRouter } from "next/router";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { TermForm } from "src/components/glossary/TermForm";
import { Layout } from "src/components/layout/auth.layout";
import { Box, CircularProgress as Spinner, Stack } from "@mui/material";
import { useMutation, useQuery } from "@urql/next";

const getTermQuery = `
query getTerm($id: uuid!) {
  term: glossary_by_pk(id: $id) {
    id
    term
    definition
    abbreviations
    references
    variants
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
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const termId = router.query.id && router.query.id[0];

  const [{ fetching, data: { term = {} } = {} }] = useQuery({
    pause: !termId,
    query: getTermQuery,
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

  // const notFound = !fetching && termId && !term.id;

  if (!term) {
    return <Layout title="Terme introuvable" />;
  }

  return (
    <Layout title={`${term.id ? "Modifier" : "Ajouter"}  un terme`}>
      <Stack>
        {fetching || deleteResult.fetching ? (
          <Spinner />
        ) : (
          <>
            {term.id && (
              <>
                <Dialog
                  isOpen={showDeleteConfirmation}
                  onDismiss={() => setShowDeleteConfirmation(false)}
                  ariaLabel="Supprimer"
                >
                  <>
                    <p>Êtes-vous sûr de vouloir supprimer ce terme ?</p>
                    <Stack
                      direction="row"
                      spacing={2}
                      mt={4}
                      justifyContent="end"
                    >
                      <Button
                        variant="outlined"
                        onClick={() => setShowDeleteConfirmation(false)}
                      >
                        Annuler
                      </Button>
                      <Button variant="contained" onClick={onDelete}>
                        Confirmer
                      </Button>
                    </Stack>
                  </>
                </Dialog>
                <Box
                  sx={{
                    justifyContent: "flex-end",
                    display: "flex",
                  }}
                  mb="small"
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
                </Box>
              </>
            )}
            <TermForm term={term} />
          </>
        )}
      </Stack>
    </Layout>
  );
}

export default EditTermPage;
