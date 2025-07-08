import { Alert, Button, FormControl, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/router";

import {
  FormDatePicker,
  FormEditionField,
  FormRadioGroup,
  FormTextField,
} from "../../forms";
import { Answer, answerRelationSchema, documentSchema, Status } from "../type";
import { AnswerWithStatus } from "./answer.query";
import {
  CdtnReferenceInput,
  KaliReferenceInput,
  LegiReferenceInput,
  OtherReferenceInput,
} from "./references";
import { getNextStatus, getPrimaryButtonLabel } from "../status/utils";
import { FicheSpDocumentInput } from "./references/FicheSpDocumentInput";
import { LoadingButton } from "src/components/button/LoadingButton";

const answerFormBaseSchema = answerRelationSchema.pick({
  content: true,
  description: true,
  contentType: true,
  messageBlockGenericNoCDT: true,
  cdtnReferences: true,
  kaliReferences: true,
  legiReferences: true,
  otherReferences: true,
  contentFichesSpDocument: true,
  displayDate: true,
});
const answerWithAnswerSchema = answerFormBaseSchema.extend({
  contentType: z.literal("ANSWER"),
  content: z
    .string({
      required_error: "Une réponse doit être renseigné",
      invalid_type_error: "Une réponse doit être renseigné",
    })
    .min(1, "Une réponse doit être renseigné"),
});
const answerWithNothingSchema = answerFormBaseSchema.extend({
  contentType: z.literal("NOTHING"),
});
const answerWithCdtSchema = answerFormBaseSchema.extend({
  contentType: z.literal("CDT"),
});
const answerWithUnfavourableSchema = answerFormBaseSchema.extend({
  contentType: z.literal("UNFAVOURABLE"),
});
const answerWithUnknownSchema = answerFormBaseSchema.extend({
  contentType: z.literal("UNKNOWN"),
});
const answerWithSPSchema = answerFormBaseSchema.extend({
  contentType: z.literal("SP"),
  contentFichesSpDocument: documentSchema,
});
const answerGenericNoCDTSchema = answerFormBaseSchema.extend({
  contentType: z.literal("GENERIC_NO_CDT"),
  messageBlockGenericNoCDT: z
    .string({
      required_error: "Un message block doit être renseigné",
      invalid_type_error: "Un message block doit être renseigné",
    })
    .min(1, "Un message block doit être renseigné"),
});

export const answerFormSchema = z.discriminatedUnion("contentType", [
  answerWithAnswerSchema,
  answerWithNothingSchema,
  answerWithCdtSchema,
  answerWithUnfavourableSchema,
  answerWithUnknownSchema,
  answerWithSPSchema,
  answerGenericNoCDTSchema,
]);
export type AnswerFormValidation = z.infer<typeof answerFormSchema>;

export type ContributionsAnswerProps = {
  answer: AnswerWithStatus;
  genericAnswerContentType: Answer["contentType"];
  onSubmit: (status: Status, data: Answer) => Promise<void>;
};

const isCodeDuTravail = (answer: Answer): boolean =>
  answer?.agreement?.id === "0000";

export const AnswerForm = ({
  answer,
  onSubmit,
  genericAnswerContentType,
}: ContributionsAnswerProps): JSX.Element => {
  const [status, setStatus] = useState<Status>("TODO");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (answer?.status) {
      setStatus(answer.status.status);
    }
  }, [answer]);
  const isAGenericWithNoCdt = genericAnswerContentType === "GENERIC_NO_CDT";

  const {
    control,
    getValues,
    trigger,
    formState: { isDirty },
    reset,
    watch,
  } = useForm<AnswerFormValidation>({
    resolver: zodResolver(answerFormSchema),
    shouldFocusError: true,
    defaultValues: {
      content: answer?.content ?? "",
      description: answer?.description ?? "",
      contentType: answer?.contentType ?? "ANSWER",
      legiReferences: answer?.legiReferences ?? [],
      kaliReferences: answer?.kaliReferences ?? [],
      otherReferences: answer?.otherReferences ?? [],
      cdtnReferences: answer?.cdtnReferences ?? [],
      contentFichesSpDocument: answer?.contentFichesSpDocument ?? undefined,
      messageBlockGenericNoCDT: answer?.messageBlockGenericNoCDT ?? undefined,
      displayDate: answer?.displayDate ?? undefined,
    },
  });

  const contentType = watch("contentType");

  const onRouteChangeStart = () => {
    if (
      !window.confirm(
        `Les modifications que vous avez apportées ne seront peut-être pas enregistrées.`
      )
    ) {
      router.events.emit("routeChangeError");
      throw new Error(`routeChange aborted`);
    }
  };

  useEffect(() => {
    if (isDirty) {
      router.events.on("routeChangeStart", onRouteChangeStart);
    }
    return () => {
      if (isDirty) {
        router.events.off("routeChangeStart", onRouteChangeStart);
      }
    };
  }, [router.events, isDirty]);
  useEffect(() => {
    window.onbeforeunload = isDirty ? () => true : null;
  }, [isDirty]);

  const isNotEditable = (answerItem: Answer | undefined) => {
    return (
      submitting ||
      (answerItem?.status?.status !== "REDACTING" &&
        answerItem?.status?.status !== "TODO" &&
        answerItem?.status?.status !== "VALIDATING")
    );
  };

  const submit = async (newStatus: Status) => {
    setSubmitting(true);
    if (!isNotEditable(answer)) {
      const isValid = await trigger();
      if (!isValid) {
        setSubmitting(false);
        return;
      }
    }
    const formData = getValues();
    setStatus(newStatus);
    onSubmit(newStatus, {
      ...answer,
      ...formData,
    }).then(() => setSubmitting(false));
    reset({ ...formData });
  };

  const agreementResponseOptions = [
    {
      label: answer.agreement.unextended
        ? "La convention collective est non étendue"
        : "La convention collective ne prévoit rien",
      value: "NOTHING",
      isDisabled: isAGenericWithNoCdt,
    },
    {
      label: "La convention collective renvoie au Code du Travail",
      value: "CDT",
      isDisabled: isAGenericWithNoCdt,
    },
    {
      label:
        "La convention collective est intégralement moins favorable que le CDT",
      value: "UNFAVOURABLE",
      isDisabled: isAGenericWithNoCdt,
    },
    {
      label: "Nous n'avons pas la réponse",
      value: "UNKNOWN",
    },
  ];
  const genericResponseOptions = [
    {
      label: "Utiliser la fiche service public",
      value: "SP",
    },
    {
      label: "Le code du travail ne prévoit rien",
      value: "GENERIC_NO_CDT",
    },
  ];
  const primaryButtonLabel = getPrimaryButtonLabel(status);
  return (
    <form>
      <Stack spacing={5}>
        {isAGenericWithNoCdt && answer.agreementId !== "0000" && (
          <Alert severity="info">
            La contribution générique est de type `Le code du travail ne prévoit
            rien`
          </Alert>
        )}
        <FormControl>
          <FormDatePicker
            name="displayDate"
            control={control}
            label="Date mise à jour"
            disabled={isNotEditable(answer)}
          />
        </FormControl>
        <FormControl>
          <FormTextField
            label="Description"
            name="description"
            disabled={isNotEditable(answer)}
            control={control}
          />
        </FormControl>
        {contentType === "ANSWER" && (
          <FormControl>
            <FormEditionField
              label="Réponse"
              name="content"
              disabled={isNotEditable(answer)}
              control={control}
            />
          </FormControl>
        )}
        {answer && (
          <FormRadioGroup
            name="contentType"
            label="Type de réponse"
            control={control}
            disabled={answer.agreement.unextended || isNotEditable(answer)}
            options={[
              {
                label: "Afficher la réponse",
                value: "ANSWER",
              },
              ...(isCodeDuTravail(answer)
                ? genericResponseOptions
                : agreementResponseOptions),
            ]}
          />
        )}
        {isCodeDuTravail(answer) && contentType === "SP" && (
          <FicheSpDocumentInput
            name="contentFichesSpDocument"
            control={control}
            disabled={isNotEditable(answer)}
          />
        )}
        {isCodeDuTravail(answer) && contentType === "GENERIC_NO_CDT" && (
          <FormControl>
            <FormTextField
              label="Message d'alerte pour les CC non traitées (si pas de CDT)"
              name="messageBlockGenericNoCDT"
              disabled={isNotEditable(answer)}
              control={control}
              multiline
              fullWidth
            />
          </FormControl>
        )}
        {answer?.agreement && !isCodeDuTravail(answer) && (
          <KaliReferenceInput
            name="kaliReferences"
            agreement={answer.agreement}
            control={control}
            disabled={isNotEditable(answer)}
          />
        )}
        <LegiReferenceInput
          name="legiReferences"
          control={control}
          disabled={isNotEditable(answer)}
        />
        <OtherReferenceInput
          name="otherReferences"
          control={control}
          disabled={isNotEditable(answer)}
        />
        <CdtnReferenceInput
          name="cdtnReferences"
          control={control}
          disabled={isNotEditable(answer)}
          idcc={
            answer.agreement?.id
              ? parseInt(answer.agreement?.id).toString()
              : undefined
          }
        />
        <Stack direction="row" justifyContent="end" spacing={2} padding={2}>
          <Button
            type="button"
            onClick={() => submit("REDACTING")}
            disabled={status === "TODO" || status === "REDACTING"}
          >
            Remettre en rédaction
          </Button>
          <Button
            variant="text"
            type="button"
            disabled={isNotEditable(answer)}
            onClick={() => submit("REDACTING")}
          >
            Sauvegarder
          </Button>
          {primaryButtonLabel && (
            <LoadingButton
              onClick={() => submit(getNextStatus(status))}
              disabled={submitting || status === "TO_PUBLISH"}
              loading={submitting}
            >
              {primaryButtonLabel}
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </form>
  );
};
