import { Form, QuestionFormData } from "../common";
import { useQuestionCreationMutation } from "./question.mutation";
import { useQuestionCreationDataQuery } from "./question.query";
import { useRouter } from "next/router";
import { CircularProgress, Link, Stack, Typography } from "@mui/material";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

export const NewQuestion = (): JSX.Element => {
  const router = useRouter();
  const { data, error } = useQuestionCreationDataQuery();
  const create = useQuestionCreationMutation();

  const onCreate = async (formData: QuestionFormData) => {
    if (!data) {
      throw new Error("Missing agreement list to create a new question");
    }
    const result = await create({
      order: formData.order,
      seo_title: formData.seo_title ? formData.seo_title : undefined,
      content: formData.content,
      message_id: formData.message_id ? formData.message_id : undefined, // use to transform empty string sent by the form to undefined
      answers: {
        data: data.agreementIds.map((item) => ({
          display_date: "01/01/2025",
          agreement_id: item.id,
          content_type: item.unextended ? "NOTHING" : undefined,
        })),
      },
    });

    router.push(
      `/contributions/questions/${result.insert_contribution_questions_one.id}`,
    );
  };

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

  if (error) {
    return (
      <Stack alignItems="center" spacing={2}>
        <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 70 }} />
        <Typography variant="h5" component="h3" color="error">
          Une erreur est survenue
        </Typography>
        <Link href={"/contributions"}>Retour à la liste des contributions</Link>
      </Stack>
    );
  }
  return (
    <>
      <Form
        messages={data.messages}
        onSubmit={onCreate}
        defaultOrder={data.nextOrder}
      />
    </>
  );
};
