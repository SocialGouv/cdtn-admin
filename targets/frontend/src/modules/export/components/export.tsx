import { Environment, Status as StatusType } from "@shared/types";
import React, { useEffect, useState } from "react";
import { EnvironmentBadge, Status } from "src/components/export-es";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { Table, Td, Th, Tr } from "src/components/table";
import { useExportEs } from "src/hooks/exportEs";
import { useUser } from "src/hooks/useUser";
import { Button, CircularProgress as Spinner, Typography } from "@mui/material";
import { FixedSnackBar } from "src/components/utils/SnackBar";
import { ConfirmModal } from "../../common/components/modals/ConfirmModal";
import { request } from "../../../lib/request";
import { ShortDocument } from "../../documents";
import DocumentList from "./document-list";

export function Export(): JSX.Element {
  const [validateExportPreprodModal, setValidateExportPreprodModal] =
    useState<boolean>(false);
  const [validateExportProdModal, setValidateExportProdModal] =
    useState<boolean>(false);
  const [exportEsState, getExportEs, runExportEs] = useExportEs();

  const { user }: any = useUser();

  const onTrigger = (env: Environment) => runExportEs(env, user);

  useEffect(() => {
    getExportEs();
  }, []);

  const [docsToUpdateProd, setDocsToUpdateProd] = useState<ShortDocument[]>([]);
  const [docsToUpdatePreProd, setDocsToUpdatePreProd] = useState<
    ShortDocument[]
  >([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);

  function getLastestDocs(env: Environment) {
    const lastestCompleted = exportEsState?.exportData.filter(
      (data) => data.status === StatusType.completed && data.environment === env
    )[0];

    const lastestCompletedDate = new Date(
      lastestCompleted?.created_at
    ).toISOString();
    return request(`/api/modified-documents?date=${lastestCompletedDate}`);
  }

  useEffect(() => {
    setIsLoadingDocs(false);
  }, [docsToUpdateProd, docsToUpdatePreProd]);
  useEffect(() => {
    if (validateExportPreprodModal) {
      getLastestDocs(Environment.preproduction).then((docs) =>
        setDocsToUpdatePreProd(docs)
      );
    }
  }, [validateExportPreprodModal]);

  useEffect(() => {
    if (validateExportProdModal) {
      getLastestDocs(Environment.production).then((docs) =>
        setDocsToUpdateProd(docs)
      );
    }
  }, [validateExportProdModal]);

  return (
    <>
      <Stack>
        {exportEsState.error && (
          <FixedSnackBar>
            <pre>{JSON.stringify(exportEsState.error, null, 2)}</pre>
          </FixedSnackBar>
        )}
        <p>
          Cette page permet de mettre à jour les données des environnements de{" "}
          <strong>production</strong> et <strong>pre-production</strong>
          et de suivre l’état de ces mises à jour.
        </p>
      </Stack>
      <Stack>
        <Inline>
          <Button
            color="primary"
            variant="contained"
            disabled={
              exportEsState.latestExportProduction?.status ===
              StatusType.running
            }
            onClick={() => {
              setValidateExportProdModal(true);
              setIsLoadingDocs(true);
            }}
          >
            Mettre à jour la production
          </Button>
          <Button
            color="secondary"
            variant="contained"
            disabled={
              exportEsState.latestExportPreproduction?.status === "running"
            }
            onClick={() => {
              setValidateExportPreprodModal(true);
              setIsLoadingDocs(true);
            }}
          >
            Mettre à jour la pre-production
          </Button>
        </Inline>

        <Table>
          <thead>
            <Tr>
              <Th align="left">Environnement</Th>
              <Th align="left">Utilisateur</Th>
              <Th align="left">Crée le</Th>
              <Th align="left">Complété le</Th>
              <Th align="left">Statut</Th>
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
              ({
                id,
                environment,
                created_at,
                updated_at,
                user,
                status,
              }: any) => {
                return (
                  <Tr key={`${id}`}>
                    <Td>
                      <EnvironmentBadge environment={environment} />
                    </Td>
                    <Td>
                      <Typography>{user.name}</Typography>
                    </Td>
                    <Td>
                      <Typography>
                        {new Date(created_at).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(created_at).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
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
                      <Status status={status} />
                    </Td>
                  </Tr>
                );
              }
            )}
          </tbody>
        </Table>
      </Stack>
      <ConfirmModal
        open={validateExportPreprodModal}
        title="Mise à jour de la Pre-Prod"
        message={
          <div>
            <p>Êtes-vous sur de vouloir mettre à jour la pre-production ?</p>
            <DocumentList
              docs={docsToUpdatePreProd}
              isLoadingDocs={isLoadingDocs}
            ></DocumentList>
          </div>
        }
        onClose={() => setValidateExportPreprodModal(false)}
        onCancel={() => setValidateExportPreprodModal(false)}
        onValidate={() => {
          setValidateExportPreprodModal(false);
          onTrigger(Environment.preproduction);
        }}
      />
      <ConfirmModal
        open={validateExportProdModal}
        title="Mise à jour de la Prod"
        message={
          <div>
            <p>Êtes-vous sur de vouloir mettre à jour la production ?</p>
            <DocumentList
              docs={docsToUpdateProd}
              isLoadingDocs={isLoadingDocs}
            ></DocumentList>
          </div>
        }
        onClose={() => setValidateExportProdModal(false)}
        onCancel={() => setValidateExportProdModal(false)}
        onValidate={() => {
          setValidateExportProdModal(false);
          onTrigger(Environment.production);
        }}
      />
    </>
  );
}
