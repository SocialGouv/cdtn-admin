import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import { Box, Skeleton, Stack, Tab, Tabs, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";
import { QuestionAnswerList } from "./EditQuestionAnswerList";

import { EditQuestionForm } from "./EditQuestionForm";
import { useQuestionQuery } from "./Question.query";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { Answer } from "../type";
import { usePublishContributionMutation } from "../answers/usePublishAnswer";
import { useSession } from "next-auth/react";
import { useContributionAnswerUpdateStatusMutation } from "../answers/answerStatus.mutation";
import { usePublishAllAnswersMutation } from "../answers/usePublishAllAnswers";

export type EditQuestionProps = {
  questionId: string;
};

enum TabValue {
  answers = 0,
  edition = 1,
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: TabValue;
  value: TabValue;
}

export const EditQuestion = ({
  questionId,
}: EditQuestionProps): JSX.Element => {
  const data = useQuestionQuery({ questionId });
  const [tabIndex, setTabIndex] = React.useState<TabValue>(TabValue.answers);
  const onPublish = usePublishContributionMutation();
  const { data: session } = useSession();
  const user = session?.user;
  const updateAnswerStatus = useContributionAnswerUpdateStatusMutation();
  const onRepublish = usePublishAllAnswersMutation();

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

  const Header = () => {
    return (
      <>
        <Breadcrumb>
          <BreadcrumbLink href={"/contributions"}>Contributions</BreadcrumbLink>
          <BreadcrumbLink>
            {`${data?.question?.order} - ${data?.question?.content}`}
          </BreadcrumbLink>
        </Breadcrumb>
      </>
    );
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setTabIndex(newValue);
  };

  function a11yProps(index: TabValue) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
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

  const republish = async () => {
    await onRepublish();
  };

  return (
    <Stack
      alignItems="stretch"
      direction="column"
      justifyContent="start"
      spacing={2}
    >
      <Header />
      <Box sx={{ borderBottom: 1 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Réponses" {...a11yProps(TabValue.answers)} />
          <Tab label="Édition" {...a11yProps(TabValue.edition)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={TabValue.answers}>
        <QuestionAnswerList
          answers={data.question.answers as Answer[]}
          onPublish={publish}
          onRepublish={republish}
        ></QuestionAnswerList>
      </TabPanel>
      <TabPanel value={tabIndex} index={TabValue.edition}>
        <EditQuestionForm question={data.question} messages={data.messages} />
      </TabPanel>
    </Stack>
  );
};
