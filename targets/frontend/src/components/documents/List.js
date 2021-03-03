/** @jsxImportSource theme-ui */

import Dialog from "@reach/dialog";
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { getInitialFilterValues } from "src/pages/contenus";
import { theme } from "src/theme";
import { Box, Card, NavLink, Text } from "theme-ui";

import { Button } from "../button";
import { Inline } from "../layout/Inline";
import { Stack } from "../layout/Stack";
import { SearchFilters } from "./SearchFilters";

/**
 * documents is a list of document to display
 *
 * onSearchUpdate is a callback to inform parent component that
 * search criteria have changed
 *
 * onUpdatePublication is a callback that receive the entries
 * to update
 *
 * updatePublishDoc is a map that will hold modified
 * documents publication status and thier cdtnId, persisting
 * through pagination navigation to allow the user to select
 * items through multiple pages.
 *
 * In order to do this we use react-hook-form (RHF) register
 * and register / set default value by hand, each time the component render
 * We also add / register previous changed item so our form is "dirty"
 * to control the button disable props.
 *
 * The updatePublishDoc is cleared, by the upper component (DocumentList)
 * when navigation change or when update is done.
 *
 */
export function DocumentList({
  documents,
  onUpdatePublication,
  onSearchUpdate,
  updatedPublishDoc,
}) {
  const router = useRouter();
  const initialFilterValues = getInitialFilterValues(router.query);

  const [showPublishDialog, setPublishDialogVisible] = useState(false);
  const openPublishDialog = () => setPublishDialogVisible(true);
  const closePublishDialog = () => setPublishDialogVisible(false);

  const defaultValues = documents.reduce((state, doc) => {
    state[doc.cdtnId] = doc.isPublished;
    return state;
  }, {});

  const formMethods = useForm({
    defaultValues,
  });
  function updatePublication() {
    const docEntries = [...updatedPublishDoc.entries()];
    onUpdatePublication(docEntries);
    docEntries.forEach(([id, published]) => {
      formMethods.reset({ [id]: published });
    });
    closePublishDialog();
  }
  documents.forEach(({ cdtnId }) => {
    formMethods.register(cdtnId);
  });

  useEffect(() => {
    [...updatedPublishDoc.entries()].forEach(([k, v]) => {
      console.log(k, v);
      formMethods.register(k);
      formMethods.setValue(k, v, { shouldDirty: true });
    });
  }, [formMethods, updatedPublishDoc]);

  return (
    <form onSubmit={formMethods.handleSubmit(openPublishDialog)}>
      <Dialog
        isOpen={showPublishDialog}
        onDismiss={closePublishDialog}
        aria-label="Modifier le statut de publication"
      >
        <Stack>
          <Stack>
            <Text>
              Etes vous sûr de vouloir modifier la publication des
              contenus&nbsp;?
            </Text>
            <Recap publications={updatedPublishDoc} />
          </Stack>
          <Inline>
            <Button onClick={updatePublication} size="small">
              Modifier la publication des contenus
            </Button>
            <Button variant="link" onClick={closePublishDialog} size="small">
              Annuler
            </Button>
          </Inline>
        </Stack>
      </Dialog>
      <Card sx={{ position: "sticky", top: 0 }} bg="white">
        <SearchFilters
          initialValues={initialFilterValues}
          onSearchUpdate={onSearchUpdate}
        />
      </Card>
      <FormProvider {...formMethods}>
        <table>
          <thead>
            <tr>
              <th />
              <th sx={{ textAlign: "left" }}>Document</th>
              <th sx={{ textAlign: "left" }}>Publié</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <DocumentRow
                updatedPublishDoc={updatedPublishDoc}
                key={doc.cdtnId}
                document={doc}
              />
            ))}
          </tbody>
        </table>
      </FormProvider>
      <button
        disabled={!formMethods.formState.isDirty}
        type="button"
        onClick={openPublishDialog}
      >
        modifier
      </button>
    </form>
  );
}
DocumentList.propTypes = {
  documents: PropTypes.arrayOf(
    PropTypes.shape({
      cdtnId: PropTypes.string.isRequired,
      isPublished: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onSearchUpdate: PropTypes.func.isRequired,
  onUpdatePublication: PropTypes.func.isRequired,
  updatedPublishDoc: PropTypes.objectOf(Map),
};

const DocumentRow = function DocumentRow({
  document: { cdtnId, source, title, isPublished },
  updatedPublishDoc,
}) {
  const { reset, setValue } = useFormContext();
  const updatePublishedRef = (event) => {
    console.log("updatePublishedRef", cdtnId, event.target.checked);
    if (updatedPublishDoc.has(cdtnId)) {
      updatedPublishDoc.delete(cdtnId);
      reset({ [cdtnId]: isPublished });
    } else {
      updatedPublishDoc.set(cdtnId, !isPublished);
      setValue(cdtnId, event.target.checked, {
        shouldDirty: true,
      });
    }
  };

  return (
    <tr>
      <td>
        <input
          name={cdtnId}
          onChange={updatePublishedRef}
          defaultChecked={
            updatedPublishDoc.has(cdtnId) ? !isPublished : isPublished
          }
          sx={checkboxStyles}
          type="checkbox"
        />
      </td>
      <td>
        <Link href={sourceToRoute({ cdtnId, source })} passHref shallow>
          <NavLink>
            <span
              sx={{
                color: isPublished ? theme.colors.link : theme.colors.muted,
              }}
            >
              {source} › {title}
            </span>
          </NavLink>
        </Link>
      </td>
      <td sx={{ textAlign: "center" }}>
        {isPublished ? (
          <Box sx={{ color: "muted" }}>
            <IoIosCheckmark />
          </Box>
        ) : (
          <Box sx={{ color: "critical" }}>
            <IoIosClose />
          </Box>
        )}
      </td>
    </tr>
  );
};

DocumentRow.propTypes = {
  document: PropTypes.shape({
    cdtnId: PropTypes.string.isRequired,
    isPublished: PropTypes.bool.isRequired,
    source: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  updatedPublishDoc: PropTypes.objectOf(Map),
};

function Recap({ publications }) {
  const items = [...publications.entries()].reduce(
    (state, [, published]) => {
      if (published) {
        state.published += 1;
      } else {
        state.unpublished += 1;
      }
      return state;
    },
    { published: 0, unpublished: 0 }
  );
  console.log(items, publications);
  return (
    <Box>
      <Text sx={{ fontWeight: 600 }}>Détails</Text>
      <ul>
        {items.published > 0 && (
          <li>
            <strong>{items.published}</strong> éléments à publier
          </li>
        )}
        {items.unpublished > 0 && (
          <li>
            <strong>{items.unpublished}</strong> éléments à dépublier
          </li>
        )}
      </ul>
    </Box>
  );
}

Recap.propTypes = {
  publications: PropTypes.objectOf(Map),
};

const sourceToRoute = ({ cdtnId, source }) => {
  switch (source) {
    case SOURCES.EDITORIAL_CONTENT:
    case SOURCES.HIGHLIGHTS:
    case SOURCES.PREQUALIFIED:
      return `/contenus/edit/${cdtnId}`;
    default:
      return `/contenus/${cdtnId}`;
  }
};

const checkboxStyles = {
  cursor: "pointer",
  display: "block",
  m: "0 0 0 small",
  padding: 0,
};
