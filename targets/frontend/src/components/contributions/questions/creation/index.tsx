import { useState } from "react";
import {
  Form,
  FormSection,
  QuestionFormData,
  ReloadRequiredError,
} from "../common";
import { useQuestionCreationMutation } from "./question.mutation";
import {
  contributionQuestionCreationDataQuery,
  useQuestionCreationDataQuery,
} from "./question.query";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useClient } from "urql";
import { CircularProgress, Link, Stack, Typography } from "@mui/material";
import { SentimentVeryDissatisfied as SentimentVeryDissatisfiedIcon } from "../../../utils/dsfrIcons";
import { AgreementTypesTable } from "../common/AgreementTypesTable";
import {
  AgreementRow,
  AgreementTypes,
  getRemainingAgreements,
  initAgreementTypes,
} from "../common/agreementTypes";
import { buildAnswers, todayIso } from "./buildAnswers";
import {
  buildMessageLabel,
  hasMessageContent,
  pickMessageValues,
  shortId,
  toMessageContent,
} from "../common/messageBlock";

export const NewQuestion = (): JSX.Element => {
  const router = useRouter();
  const client = useClient();
  const { data: session } = useSession();
  const { data, error } = useQuestionCreationDataQuery();
  const create = useQuestionCreationMutation();
  const [types, setTypes] = useState<AgreementTypes | undefined>(undefined);

  // Les CC non étendues sont verrouillées sur « ne prévoit rien » dès le chargement
  const agreementTypes: AgreementTypes =
    types ?? (data ? initAgreementTypes(data.agreements) : {});

  const onCreate = async (formData: QuestionFormData) => {
    if (!data) {
      throw new Error("Missing agreement list to create a new question");
    }
    if (!session?.user?.id) {
      throw new Error("Utilisateur non connecté");
    }
    if (getRemainingAgreements(data.agreements, agreementTypes).length > 0) {
      throw new Error("Toutes les CC doivent avoir un type de réponse");
    }

    // Une CC supportée a pu être ajoutée depuis l'ouverture de la page
    const fresh = await client
      .query<{
        agreements: AgreementRow[];
      }>(
        contributionQuestionCreationDataQuery,
        {},
        { requestPolicy: "network-only" }
      )
      .toPromise();
    const knownIds = new Set(data.agreements.map((item) => item.id));
    const freshAgreements = fresh.data?.agreements ?? [];
    if (freshAgreements.some((item) => !knownIds.has(item.id))) {
      throw new ReloadRequiredError(
        "Une nouvelle convention collective est disponible depuis l'ouverture de la page : rechargez la page pour lui attribuer un type de réponse."
      );
    }

    const messageValues = pickMessageValues(formData);
    const result = await create({
      order: formData.order,
      seo_title: formData.seo_title ? formData.seo_title : undefined,
      content: formData.content,
      // Chaque contribution a sa propre ligne de message (aucune si aucun message n'est renseigné)
      ...(hasMessageContent(messageValues)
        ? {
            message: {
              data: {
                label: buildMessageLabel(formData.order, shortId()),
                ...toMessageContent(messageValues),
              },
            },
          }
        : {}),
      introduction_nothing: formData.introduction_nothing || null,
      introduction_cdt: formData.introduction_cdt || null,
      template_answer: formData.template_answer || null,
      answers: {
        data: buildAnswers({
          agreements: data.agreements,
          types: agreementTypes,
          genericIntroduction: formData.generic_introduction,
          genericContent: formData.generic_answer_content ?? "",
          genericLegiReferences: formData.generic_legi_references,
          genericOtherReferences: formData.generic_other_references,
          template: formData.template_answer ?? "",
          displayDate: todayIso(),
          userId: session.user.id,
        }),
      },
    });

    router.push(
      `/contributions/questions/${result.insert_contribution_questions_one.id}`
    );
  };

  if (error) {
    return (
      <Stack alignItems="center" spacing={2}>
        <SentimentVeryDissatisfiedIcon color="error" fontSize="large" />
        <Typography variant="h5" component="h3" color="error">
          Une erreur est survenue
        </Typography>
        <Link href={"/contributions"}>Retour à la liste des contributions</Link>
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack alignItems="center" spacing={2}>
        <CircularProgress size={70} />
        <Typography variant="h5" component="h3">
          Chargement...
        </Typography>
        <Link href={"/contributions"}>Retour à la liste des contributions</Link>
      </Stack>
    );
  }

  const remaining = getRemainingAgreements(data.agreements, agreementTypes);

  return (
    <Form
      creation
      onSubmit={onCreate}
      defaultOrder={data.nextOrder}
      submitDisabled={remaining.length > 0}
      extraFields={
        <FormSection title="Type de réponse par convention collective">
          <AgreementTypesTable
            agreements={data.agreements}
            types={agreementTypes}
            onChange={setTypes}
          />
        </FormSection>
      }
    />
  );
};
