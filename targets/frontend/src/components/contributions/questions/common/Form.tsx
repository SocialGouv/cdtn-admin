import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertColor,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { CONTRIBUTION_COLORS } from "../../../utils/contributionColors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
} from "../../../utils/dsfrIcons";
import { z } from "zod";
import {
  FormEditionField,
  FormSelect,
  FormTextField,
} from "src/components/forms";
import { Message, QuestionBase, questionRelationSchema } from "../../type";
import { SnackBar } from "../../../utils/SnackBar";
import { LoadingButton } from "../../../button/LoadingButton";

type EditQuestionProps = {
  question?: QuestionBase;
  messages: Message[];
  defaultOrder?: number;
  onSubmit: (props: QuestionFormData) => Promise<void>;
  /** Création : affiche la réponse du Code du travail (obligatoire) */
  creation?: boolean;
  /** Contenu additionnel avant le bouton (tableau des types de réponse en création) */
  extraFields?: ReactNode;
  /** Désactive « Créer » (ex. : CC sans type de réponse) */
  submitDisabled?: boolean;
  /** Demande une confirmation si le template est vide */
  confirmEmptyTemplate?: boolean;
};

/** Erreur dont la solution est de recharger la page (ex. : nouvelle CC supportée) */
export class ReloadRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReloadRequiredError";
  }
}

const formDataSchema = z.object({
  message_id: questionRelationSchema.shape.message_id.or(z.literal("")),
  content: questionRelationSchema.shape.content,
  seo_title: questionRelationSchema.shape.seo_title,
  order: questionRelationSchema.shape.order,
  introduction_nothing: z.string().optional(),
  introduction_cdt: z.string().optional(),
  template_answer: z.string().optional(),
  generic_answer_content: z.string().optional(),
});

export type QuestionFormData = z.infer<typeof formDataSchema>;

export const Form = ({
  question,
  messages,
  defaultOrder,
  onSubmit,
  creation = false,
  extraFields,
  submitDisabled = false,
  confirmEmptyTemplate = false,
}: EditQuestionProps): JSX.Element => {
  const {
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(formDataSchema),
    shouldFocusError: true,
    defaultValues: {
      content: question?.content ?? "",
      message_id: question?.message_id ?? "",
      seo_title: question?.seo_title ?? "",
      order: question?.order ?? defaultOrder ?? -1,
      introduction_nothing: question?.introduction_nothing ?? "",
      introduction_cdt: question?.introduction_cdt ?? "",
      template_answer: question?.template_answer ?? "",
      generic_answer_content: "",
    },
  });
  const genericContent = watch("generic_answer_content");
  const [submitError, setSubmitError] = useState<Error | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingData = useRef<QuestionFormData | undefined>(undefined);
  const [message, setMessage] = useState<Message | undefined>(undefined);
  const watchMessageId = watch("message_id", question?.message_id);
  const [submitting, setSubmit] = useState<boolean>(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  useEffect(() => {
    if (watchMessageId) {
      const message = messages.find((message) => message.id === watchMessageId);
      setMessage(message);
    } else {
      setMessage(undefined);
    }
  }, [watchMessageId, messages]);

  const submitData = async (formData: QuestionFormData) => {
    setSubmit(true);
    setSubmitError(undefined);
    pendingData.current = formData;
    try {
      await onSubmit(formData);
      setSnack({ open: true, severity: "success", message: "Sauvegardé" });
    } catch (e: any) {
      if (creation) {
        // En création : alerte avec « Réessayer », la saisie est conservée
        setSubmitError(e);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: `Erreur: ${e.message}`,
        });
      }
    }
    setSubmit(false);
  };

  const onSubmitForm = async (formData: QuestionFormData) => {
    if (creation && !formData.generic_answer_content?.trim()) {
      setError("generic_answer_content", {
        type: "required",
        message: "La réponse du Code du travail doit être renseignée",
      });
      return;
    }
    if (creation && confirmEmptyTemplate && !formData.template_answer?.trim()) {
      pendingData.current = formData;
      setConfirmOpen(true);
      return;
    }
    await submitData(formData);
  };

  return (
    <Stack mt={4} spacing={2}>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack spacing={4}>
          {creation && errors.generic_answer_content && (
            <Alert severity="error" role="alert">
              <strong>Le formulaire contient des erreurs :</strong>
              <ul style={{ margin: 0 }}>
                <li>{errors.generic_answer_content.message}</li>
              </ul>
            </Alert>
          )}
          <FormTextField
            name="order"
            type="number"
            control={control}
            hintText={
              <>
                Cette valeur est indicative. Vous pouvez la modifier mais le
                numéro de question ne doit pas déjà être utilisée.{" "}
                <strong>
                  Il est recommandé de ne pas modifier la valeur par défaut.
                </strong>
              </>
            }
            label="Ordre"
            fullWidth
            disabled={question !== undefined}
          />
          <FormTextField
            name="content"
            control={control}
            label="Nom de la question"
            fullWidth
          />
          <FormTextField
            name="seo_title"
            control={control}
            label="Nom SEO"
            hintText="Cette valeur va remplacer le nom du thème dans le titre de la page pour les contributions personnalisées. Laissez vide pour utiliser le thème de la question par défaut."
            fullWidth
          />
          <Stack spacing={2}>
            <FormSelect
              options={[{ label: "Aucun", id: "" }]
                .concat(messages)
                .map((item) => ({
                  label: item.label,
                  value: item.id,
                }))}
              name="message_id"
              control={control}
              label="Message associé à la question"
              fullWidth
            />
            {message && (
              <Card
                sx={{
                  background: "#f2f6fa",
                  padding: "16px",
                }}
                variant={"outlined"}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est traitée"
                    id="contentAgreement"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective est traitée
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentAgreement,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est non traitée, non sélectionnée ou si la réponse est dépubliée"
                    id="contentLegal"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective est non
                      traitée et n&apos;a pas de légal
                    </Typography>
                    <Tooltip title="Autres cas: non sélectionnée ou si la réponse est dépubliée">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentAgreementWithoutLegal,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective ne prévoit rien"
                    id="contentUnplanned"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective ne prévoit
                      rien
                    </Typography>
                    <Tooltip title="Autres cas: renvoie au Code du Travail ou est intégralement moins favorable que le Code du Travail">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentNotHandled,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est non traitée, non sélectionnée ou si la réponse est dépubliée"
                    id="contentLegal"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective ne prévoit
                      rien et n&apos;a pas de légal
                    </Typography>
                    <Tooltip title="Autres cas: non sélectionnée ou si la réponse est dépubliée">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentNotHandledWithoutLegal,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est non traitée, non sélectionnée ou si la réponse est dépubliée"
                    id="contentLegal"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective est non
                      traitée
                    </Typography>
                    <Tooltip title="Autres cas: non sélectionnée ou si la réponse est dépubliée">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: message.contentLegal }}
                    />
                  </AccordionDetails>
                </Accordion>
              </Card>
            )}
          </Stack>
          {creation && (
            <Stack spacing={1}>
              <FormEditionField
                name="generic_answer_content"
                control={control}
                label="Réponse du Code du travail"
                disabled={submitting}
              />
              <HelpText>
                Obligatoire. Collez ici la réponse du Code du travail : elle
                servira de réponse générique et de contenu pour les CC qui ne
                prévoient rien ou renvoient au Code du travail. Le surlignage et
                les variables n&apos;y sont pas disponibles.
              </HelpText>
            </Stack>
          )}
          <Stack spacing={1}>
            <FormEditionField
              name="introduction_nothing"
              control={control}
              label="Introduction « La convention collective ne prévoit rien »"
              variablesEnabled
              disabled={submitting}
            />
            <HelpText>
              Facultatif. Affichée avant la réponse du Code du travail pour les
              CC de type « ne prévoit rien ». Vous pouvez y insérer le nom de la
              CC avec « Insérer une variable ».
            </HelpText>
          </Stack>
          <Stack spacing={1}>
            <FormEditionField
              name="introduction_cdt"
              control={control}
              label="Introduction « La convention collective renvoie au Code du travail »"
              variablesEnabled
              disabled={submitting}
            />
            <HelpText>
              Facultatif. Affichée avant la réponse du Code du travail pour les
              CC de type « renvoie au Code du travail ».
            </HelpText>
          </Stack>
          <Stack spacing={1}>
            <FormEditionField
              name="template_answer"
              control={control}
              label="Template « La convention collective prévoit des dispositions »"
              highlightEnabled
              variablesEnabled
              disabled={submitting}
            />
            <HelpText>
              Facultatif. Proposé comme contenu des CC de type « Afficher la
              réponse ». Surlignez les passages à adapter : une réponse
              contenant du texte surligné ne peut pas être soumise à validation.
            </HelpText>
            {question && (
              <Alert severity="info">
                Modifier le template n&apos;est pas répercuté sur les réponses
                déjà créées.
              </Alert>
            )}
          </Stack>
          {extraFields}
          {submitError && (
            <Alert
              severity="error"
              role="alert"
              action={
                submitError instanceof ReloadRequiredError ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => window.location.reload()}
                  >
                    Recharger la page
                  </Button>
                ) : (
                  <Button
                    color="inherit"
                    size="small"
                    disabled={submitting}
                    onClick={() =>
                      pendingData.current && submitData(pendingData.current)
                    }
                  >
                    Réessayer
                  </Button>
                )
              }
            >
              {submitError.message}
              {!(submitError instanceof ReloadRequiredError) &&
                " Rien n'a été créé, votre saisie est conservée."}
            </Alert>
          )}
          <Stack direction="row" spacing={2} justifyContent="end">
            <LoadingButton
              variant="contained"
              color="success"
              loading={submitting}
              disabled={submitDisabled || (creation && !genericContent?.trim())}
              type="submit"
            >
              {question ? "Sauvegarder" : "Créer"}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-empty-template-title"
      >
        <DialogTitle id="confirm-empty-template-title">
          Le template est vide
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Des CC sont de type « Afficher la réponse » mais le template est
            vide : leurs réponses seront créées sans contenu.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setConfirmOpen(false);
              if (pendingData.current) {
                submitData(pendingData.current);
              }
            }}
          >
            Créer quand même
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

const HelpText = styled(Typography)(() => ({
  fontSize: "0.875rem",
  color: CONTRIBUTION_COLORS.textMention,
}));

const StyledIconButton = styled(IconButton)(() => {
  return {
    padding: 0,
    marginLeft: "8px",
  };
});
