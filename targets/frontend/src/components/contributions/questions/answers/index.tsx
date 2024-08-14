import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { Skeleton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { List } from "./List";
import { useAnswersQuery } from "./Answers.query";
import { usePublishContributionMutation } from "../../answers/usePublishAnswer";
import { useSession } from "next-auth/react";
import { useContributionAnswerUpdateStatusMutation } from "../../answers/answerStatus.mutation";

type Props = {
  questionId: string;
};

export const Answers = ({ questionId }: Props): JSX.Element => {
  const { data: session } = useSession();
  const user = session?.user;

  const data = useAnswersQuery({ questionId });
  const onPublish = usePublishContributionMutation();
  const updateAnswerStatus = useContributionAnswerUpdateStatusMutation();

  if (data === undefined || !user) {
    return <Skeleton />;
  }

  if (data === "not_found") {
    return (
      <Stack alignItems="center" spacing={2}>
        <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 70 }} />
        <Typography variant="h5" component="h3" color="error">
          Question non trouvée
        </Typography>
        <Link href={"/contributions"}>Retour à la liste des contributions</Link>
      </Stack>
    );
  }

  if (data === "error") {
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

  const publish = async (id: string) => {
    await onPublish(id);
    await updateAnswerStatus({
      id: id,
      status: "TO_PUBLISH",
      userId: user?.id,
    });
    data.reExecute();
  };

  return <List answers={data.answers} onPublish={publish}></List>;
};
