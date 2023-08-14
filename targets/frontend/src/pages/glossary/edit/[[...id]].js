import { useRouter } from "next/router";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { TermForm } from "src/components/glossary/TermForm";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Box, CircularProgress as Spinner } from "@mui/material";
import { useMutation, useQuery } from "urql";

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

export default withCustomUrqlClient(withUserProvider(EditTermPage));
