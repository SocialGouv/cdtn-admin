import {
  Alert,
  Button,
  DialogActions,
  DialogContentText,
  Skeleton,
  Stack,
} from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React from "react";
import { useAgreementUpdateMutation } from "./agreement.mutation";
import { useAgreementQuery } from "./agreement.query";
import { AgreementForm } from "../Common";
import { usePublishMutation } from "../../../documents/components/publish.mutation";
import { useAgreementDeleteMutation } from "./delete.mutation";
import { useRouter } from "next/router";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

type Props = {
  id: string;
};

export const AgreementEdition = ({ id }: Props): React.ReactElement => {
  const router = useRouter();

  const { data, fetching, error, reexecuteQuery } = useAgreementQuery({ id });
  const update = useAgreementUpdateMutation();
  const publish = usePublishMutation();
  const deleteAgreement = useAgreementDeleteMutation();

  const [open, setOpen] = React.useState(false);

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la récupération de la convention collective.
        <p>
          <code>{JSON.stringify(error)}</code>
        </p>
      </Alert>
    );
  }

  if (!data && fetching) {
    return <Skeleton />;
  }

  if (!data) {
    return (
      <Alert severity="error">
        Cette convention collective n&apos;existe plus.
      </Alert>
    );
  }

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/agreements"}>
        Conventions collectives
      </BreadcrumbLink>
      <BreadcrumbLink>{data.name}</BreadcrumbLink>
    </Breadcrumb>
  );

  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <Header />
        <Stack mt={4} spacing={2}>
          <AgreementForm
            agreement={data}
            onUpsert={async (props) => {
              await update(props);
              reexecuteQuery({ requestPolicy: "network-only" });
            }}
            onPublish={async () => {
              if (data?.id) {
                await publish({
                  id: data.id,
                  source: "conventions_collectives",
                });
              } else {
                throw new Error(
                  "Aucune convention collective à publier n'a été détectée"
                );
              }
            }}
            onDelete={async () => {
              setOpen(true);
            }}
          />
        </Stack>
      </Stack>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          A lire avant suppression d&apos;une convention collective
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
              Vous êtes sur le point de supprimer une convention collective du
              site.
            </p>
            <p>
              Merci de contacter l&apos;équipe de dev sur mattermost dans les
              cas suivants :
            </p>
            <ul>
              <li>
                La convention collective a été fusionnée dans une autre
                convention collective.
              </li>
              <li>
                Si la convention collective a été divisée en plusieurs
                conventions collectives
              </li>
            </ul>
            <p>Voulez-vous quand même la supprimer maintenant&nbsp;?</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            type="button"
            color="success"
            onClick={async () => {
              if (data?.id) {
                await deleteAgreement({ id: data.id });
                await router.push(`/agreements`);
              } else {
                throw new Error(
                  "Aucune convention collective à publier n'a été détectée"
                );
              }
            }}
            autoFocus
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
