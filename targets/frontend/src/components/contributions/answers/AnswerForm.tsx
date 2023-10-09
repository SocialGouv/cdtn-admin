import { Button, FormControl, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FormEditionField, FormRadioGroup, FormTextField } from "../../forms";
import { Answer, Status, answerRelationSchema, documentSchema } from "../type";
import { AnswerWithStatus } from "./answer.query";
import {
  CdtnReferenceInput,
  KaliReferenceInput,
  LegiReferenceInput,
  OtherReferenceInput,
} from "./references";
import { getNextStatus, getPrimaryButtonLabel } from "../status/utils";
import { FicheSpDocumentInput } from "./references/FicheSpDocumentInput";

const answerFormBaseSchema = answerRelationSchema.pick({
  content: true,
  contentType: true,
  cdtnReferences: true,
  kaliReferences: true,
  legiReferences: true,
  otherReferences: true,
  contentFichesSpDocument: true,
});
const answerWithAnswerSchema = answerFormBaseSchema.extend({
  contentType: z.literal("ANSWER"),
  content: z
    .string({
      required_error: "Une réponse doit être renseigner",
      invalid_type_error: "Une réponse doit être renseigner",
    })
    .min(1, "Une réponse doit être renseigner"),
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

export const answerFormSchema = z.discriminatedUnion("contentType", [
  answerWithAnswerSchema,
  answerWithNothingSchema,
  answerWithCdtSchema,
  answerWithUnfavourableSchema,
  answerWithUnknownSchema,
  answerWithSPSchema,
]);
export type AnswerFormValidation = z.infer<typeof answerFormSchema>;

export type ContributionsAnswerProps = {
  answer: AnswerWithStatus;
  onSubmit: (status: Status, data: Answer) => void;
};

const isNotEditable = (answer: Answer | undefined) =>
  answer?.status?.status !== "REDACTING" &&
  answer?.status?.status !== "TODO" &&
  answer?.status?.status !== "VALIDATING";

const isCodeDuTravail = (answer: Answer): boolean =>
  answer?.agreement?.id === "0000";

export const AnswerForm = ({
  answer,
  onSubmit,
}: ContributionsAnswerProps): JSX.Element => {
  const [status, setStatus] = useState<Status>("TODO");
  useEffect(() => {
    if (answer?.status) {
      setStatus(answer.status.status);
    }
  }, [answer]);
  const { control, getValues, trigger } = useForm<AnswerFormValidation>({
    resolver: zodResolver(answerFormSchema),
    shouldFocusError: true,
    defaultValues: {
      content: answer?.content ?? "",
      contentType: answer?.contentType ?? "ANSWER",
      legiReferences: answer?.legiReferences ?? [],
      kaliReferences: answer?.kaliReferences ?? [],
      otherReferences: answer?.otherReferences ?? [],
      cdtnReferences: answer?.cdtnReferences ?? [],
      contentFichesSpDocument: answer?.contentFichesSpDocument ?? undefined,
    },
  });

  const submit = async (newStatus: Status) => {
    const isValid = await trigger();

    if (isValid) {
      setStatus(newStatus);
      const formData = getValues();
      onSubmit(newStatus, {
        ...answer,
        ...formData,
      });
    }
  };

  const agreementResponseOptions = [
    {
      label: "La convention collective ne prévoit rien",
      value: "NOTHING",
    },
    {
      label: "La convention collective renvoie au Code du Travail",
      value: "CDT",
    },
    {
      label:
        "La convention collective intégralement moins favorable que le CDT",
      value: "UNFAVOURABLE",
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
  ];
  return (
    <>
      <form
        onSubmit={(e) => {
          // This is a hack to prevent the form from being submitted by the tiptap editor.
          // The details extension is not working properly and submit the form when click on the arrow.
          // See https://github.com/ueberdosis/tiptap/issues/4384
          e.preventDefault();
        }}
      >
        <Stack spacing={5}>
          <FormControl>
            <FormTextField
              name="updateDate"
              control={control}
              label="Date mise à jour"
              disabled
              labelFixed
            />
          </FormControl>
          <FormControl>
            <FormEditionField
              label="Réponse"
              name="content"
              disabled={isNotEditable(answer)}
              control={control}
            />
          </FormControl>
          {answer && (
            <FormRadioGroup
              name="contentType"
              label="Type de réponse"
              control={control}
              disabled={isNotEditable(answer)}
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
          {answer && isCodeDuTravail(answer) && (
            <FicheSpDocumentInput
              name="contentFichesSpDocument"
              control={control}
              disabled={isNotEditable(answer)}
            />
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
          />
          <Stack direction="row" justifyContent="end" spacing={2} padding={2}>
            <Button
              variant="outlined"
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
            <Button
              variant="contained"
              type="button"
              color="success"
              onClick={() => submit(getNextStatus(status))}
              disabled={status === "PUBLISHED"}
            >
              {getPrimaryButtonLabel(status)}
            </Button>
          </Stack>
        </Stack>
      </form>
    </>
  );
};
