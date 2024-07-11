import { Environment } from "@socialgouv/cdtn-types";
import React, { useEffect, useState } from "react";
import {
  EnvironmentBadge,
  InformationsDialog,
  Status,
} from "src/components/export-es";
import { Table, Td, Th, Tr } from "src/components/table";
import { useSession } from "next-auth/react";
import {
  Button,
  CircularProgress as Spinner,
  Stack,
  Typography,
} from "@mui/material";
import { ShowDocumentsToUpdateModal } from "./ShowDocumentsToUpdateModal";
import { FixedSnackBar } from "src/components/utils/SnackBar";
import { useExportEs } from "../hooks/export";

export function Export(): JSX.Element {
  const [validateExportPreprodModal, setValidateExportPreprodModal] =
    useState<boolean>(false);
  const [validateExportProdModal, setValidateExportProdModal] =
    useState<boolean>(false);
  const [exportEsState, getExportEs, runExportEs, getLatestDeployDate] =
    useExportEs();

  const { data } = useSession();
  const user = data?.user;

  const onTrigger = (env: Environment) => {
    if (!user) {
      alert("Vous devez être connecté pour effectuer cette action");
      return;
    }
    runExportEs(env, user);
  };

  useEffect(() => {
    getExportEs(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      getExportEs(true);
    }, 20000); // 20000 milliseconds = 20 seconds

    return () => clearInterval(interval);
  }, [getExportEs]);

  return (
    <>
      {exportEsState.error && (
        <FixedSnackBar>
          <pre>{JSON.stringify(exportEsState.error, null, 2)}</pre>
        </FixedSnackBar>
      )}
      <p>
        Cette page permet de mettre à jour les données des environnements de{" "}
        <strong>production</strong> et <strong>pre-production</strong> et de
        suivre l’état de ces mises à jour.
      </p>

      <Stack direction="row" spacing={2}>
        <Button
          color="primary"
          variant="contained"
          onClick={() => {
            setValidateExportProdModal(true);
          }}
        >
          Mettre à jour la production
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            setValidateExportPreprodModal(true);
          }}
        >
          Mettre à jour la pre-production
        </Button>
      </Stack>
      <Stack mt={2}>
        <Table>
          <thead>
            <Tr>
              <Th align="left">Environnement</Th>
              <Th align="left">Utilisateur</Th>
              <Th align="left">Début</Th>
              <Th align="left">Fin</Th>
              <Th align="left">Statut</Th>
              <Th align="left">Informations</Th>
            </Tr>
          </thead>
          {exportEsState.isGetExportLoading && (
            <tbody>
              <tr>
                <td colSpan={5}>
                  <Spinner />
                </td>
              </tr>
            </tbody>
          )}
          <tbody>
            {exportEsState.exportData.map(
              (
                {
                  id,
                  environment,
                  created_at,
                  updated_at,
                  user,
                  status,
                  error,
                  documentsCount,
                },
                index
              ) => {
                const dateCreatedInfo = `${new Date(
                  created_at
                ).toLocaleDateString("fr-FR")} à ${new Date(
                  created_at
                ).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;
                return (
                  <Tr key={`${id}`}>
                    <Td>
                      <EnvironmentBadge environment={environment} />
                    </Td>
                    <Td>
                      <Typography>{user?.name}</Typography>
                    </Td>
                    <Td>
                      <Typography>{dateCreatedInfo}</Typography>
                    </Td>
                    <Td>
                      <Typography>
                        {new Date(updated_at).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(updated_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Td>
                    <Td>
                      <Status status={status} error={error} />
                    </Td>
                    <Td>
                      {documentsCount ? (
                        <InformationsDialog
                          documentsCount={documentsCount}
                          oldDocumentsCount={
                            exportEsState.exportData[index + 1]?.documentsCount
                          }
                          dateInfo={dateCreatedInfo}
                        />
                      ) : (
                        <Typography>Aucune information</Typography>
                      )}
                    </Td>
                  </Tr>
                );
              }
            )}
          </tbody>
        </Table>
      </Stack>
      <ShowDocumentsToUpdateModal
        open={validateExportPreprodModal}
        name="Pre-Prod"
        onClose={() => setValidateExportPreprodModal(false)}
        onCancel={() => setValidateExportPreprodModal(false)}
        onValidate={() => {
          setValidateExportPreprodModal(false);
          onTrigger(Environment.preproduction);
        }}
        date={getLatestDeployDate(Environment.preproduction)}
      />
      <ShowDocumentsToUpdateModal
        open={validateExportProdModal}
        name="Prod"
        onClose={() => setValidateExportProdModal(false)}
        onCancel={() => setValidateExportProdModal(false)}
        onValidate={() => {
          setValidateExportProdModal(false);
          onTrigger(Environment.production);
        }}
        date={getLatestDeployDate(Environment.production)}
      />
    </>
  );
}
