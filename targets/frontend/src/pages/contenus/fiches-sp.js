/** @jsxImportSource theme-ui */

import { ErrorMessage } from "@hookform/error-message";
import { useRouter } from "next/router";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { Button, IconButton } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { Li, List } from "src/components/list";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import {
  Box,
  Field,
  Flex,
  Heading,
  Label,
  Message,
  Spinner,
  Text,
} from "theme-ui";
import { useMutation, useQuery } from "urql";

const SelectionContext = createContext([[], () => {}]);

function FichesServicePublicPage() {
  const [selectedItems, setSelectedItems] = useState([]);

  return (
    <SelectionContext.Provider value={[selectedItems, setSelectedItems]}>
      <Layout title="Fiches service-public.fr">
        <FichesServicePublicContainer />
      </Layout>
    </SelectionContext.Provider>
  );
}

export default withCustomUrqlClient(withUserProvider(FichesServicePublicPage));

function FichesServicePublicContainer() {
  const router = useRouter();
  const context = useMemo(
    () => ({ additionalTypenames: ["service_public_contents"] }),
    []
  );

  const [, setSelectedItems] = useContext(SelectionContext);

  const itemsPerPage = 25;

  const page = parseInt(router.query?.page) || 0;

  const [result] = useQuery({
    context,
    query: getFicheServicePublicId,
    variables: {
      limit: itemsPerPage,
      offset: page * itemsPerPage,
    },
  });

  const [, deleteFicheMutation] = useMutation(deleteFicheServicePublicId);
  const deleteFicheSp = useCallback(
    (ids) => {
      deleteFicheMutation({ ids });
      setSelectedItems([]);
    },
    [deleteFicheMutation]
  );

  const { fetching, error, data } = result;

  if (error) {
    return <Message variant="primary">{error.message}</Message>;
  }
  if (fetching) {
    return <Spinner />;
  }
  return (
    <Stack>
      <AddFiches />
      {data.ficheIds.length > 0 ? (
        <Stack>
          <ServicPublicList items={data.ficheIds} />
          <Actions onDelete={deleteFicheSp} />
          <Pagination
            count={data.aggs.aggregate.count}
            currentPage={page}
            pageSize={itemsPerPage}
          />
        </Stack>
      ) : (
        "Pas de résultat"
      )}
    </Stack>
  );
}

function ServicPublicList({ items }) {
  return (
    <List>
      {items.map((item) => (
        <Li key={item.id}>
          <ServicePublicItem item={item} />
        </Li>
      ))}
    </List>
  );
}

function ServicePublicItem({ item }) {
  const [selectedItems, setSelectedItems] = useContext(SelectionContext);

  function updateSelection(event) {
    if (event.target.checked) {
      setSelectedItems(selectedItems.concat(item.id));
    } else {
      setSelectedItems(selectedItems.filter((id) => item.id !== id));
    }
  }
  return (
    <Label>
      <input
        type="checkbox"
        defaultChecked={selectedItems.includes(item.id)}
        onChange={updateSelection}
      />
      {item.id} ({item.status})
    </Label>
  );
}

function Actions({ onDelete }) {
  const [selectedItems] = useContext(SelectionContext);
  const [showDeleteDialog, setDeleteDialogVisible] = useState(false);
  const openDeleteDialog = () => setDeleteDialogVisible(true);
  const closeDeleteDialog = () => setDeleteDialogVisible(false);

  function deleteAction() {
    onDelete(selectedItems);
    closeDeleteDialog();
  }

  return (
    <Box>
      <Dialog
        isOpen={showDeleteDialog}
        onDismiss={closeDeleteDialog}
        aria-label="Modifier le statut de publication"
      >
        <Stack>
          <Stack>
            <Text>
              Êtes vous sûr de vouloir supprimer {selectedItems.length} fiches?
            </Text>
          </Stack>
          <Inline>
            <Button onClick={deleteAction} size="small">
              Supprimer les fiches
            </Button>
            <Button variant="link" onClick={closeDeleteDialog} size="small">
              Annuler
            </Button>
          </Inline>
        </Stack>
      </Dialog>
      {selectedItems.length > 0 && (
        <Button
          onClick={openDeleteDialog}
          outline
          size="small"
          variant="secondary"
        >
          Supprimer
        </Button>
      )}
    </Box>
  );
}

function AddFiches() {
  const [showAddDialog, setAddDialogVisible] = useState(false);
  const openAddDialog = () => setAddDialogVisible(true);
  const closeAddDialog = () => setAddDialogVisible(false);
  const [, insertFicheMutation] = useMutation(insertFicheServicePublicId);
  const insertFicheSp = (ids) => {
    insertFicheMutation({
      objects: ids.map((id) => ({ id })),
    });
    closeAddDialog();
  };
  return (
    <Box>
      <Button size="small" onClick={openAddDialog}>
        Ajouter des fiches
      </Button>
      <Dialog
        isOpen={showAddDialog}
        onDismiss={closeAddDialog}
        aria-label="Modifier le statut de publication"
      >
        <AddFicheSpForm onAdd={insertFicheSp} />
      </Dialog>
    </Box>
  );
}

function AddFicheSpForm({ onAdd }) {
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
          variant="secondary"
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

const getFicheServicePublicId = `
query getServicePublicId($offset: Int = 0, $limit: Int = 50) {
  ficheIds: service_public_contents( offset: $offset, limit: $limit, order_by: [{status: desc, id: asc}]) {
   id, status
  }
  aggs:service_public_contents_aggregate {
    aggregate{
      count
    }
  }
}
`;

const insertFicheServicePublicId = `
mutation addFichesServicePublic($objects: [service_public_contents_insert_input!]!) {
  fiches: insert_service_public_contents(objects: $objects) {
    affected_rows
    returning {
      id, status
    }
  }
}
`;

const deleteFicheServicePublicId = `
mutation deleteServicePublicIds($ids: [String!] = []) {
  delete_service_public_contents(where: {
    id: {_in: $ids}
  }) {
    affected_rows
    returning {
      id
    }
  }
}
`;
