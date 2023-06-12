import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {
  Breadcrumbs,
  Skeleton,
  Stack,
  Typography,
  Box,
  Tab,
} from "@mui/material";
import { TabList, TabPanel, TabContext } from "@mui/lab";
import Link from "next/link";
import React from "react";
import { EditQuestionAnswerList } from "./EditQuestionAnswerList";

import { EditQuestionForm } from "./EditQuestionForm";
import { useQuestionQuery } from "./Question.query";

export type EditQuestionProps = {
  questionId: string;
};

enum TabValue {
  answers = "1",
  edition = "2",
}

export const EditQuestion = ({
  questionId,
}: EditQuestionProps): JSX.Element => {
  const data = useQuestionQuery({ questionId });
  const [tabIndex, setTabIndex] = React.useState("1");

  if (data === undefined) {
    return (
      <>
        <Skeleton />
      </>
    );
  }

  if (data === "not_found") {
    return (
      <>
        <Stack alignItems="center" spacing={2}>
          <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 70 }} />
          <Typography variant="h5" component="h3" color="error">
            Question non trouvée
          </Typography>
          <Link href={"/contributions"}>
            Retour à la liste des contributions
          </Link>
        </Stack>
      </>
    );
  }

  if (data === "error") {
    return (
      <>
        <Stack alignItems="center" spacing={2}>
          <SentimentVeryDissatisfiedIcon color="error" sx={{ fontSize: 70 }} />
          <Typography variant="h5" component="h3" color="error">
            Une erreur est survenue
          </Typography>
          <Link href={"/contributions"}>
            Retour à la liste des contributions
          </Link>
        </Stack>
      </>
    );
  }

  const Header = () => (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href={"/contributions"}>Contributions</Link>
        <div>{data?.question?.content}</div>
      </Breadcrumbs>
    </>
  );

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <Header />
        <TabContext value={tabIndex}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleTabChange}>
              <Tab label="Réponses" value={TabValue.answers} />
              <Tab label="Édition" value={TabValue.edition} />
            </TabList>
          </Box>
          <TabPanel value={TabValue.answers}>
            <EditQuestionAnswerList
              answers={data.question.answers}
            ></EditQuestionAnswerList>
          </TabPanel>
          <TabPanel value={TabValue.edition}>
            <EditQuestionForm
              question={data.question}
              messages={data.messages}
            />
          </TabPanel>
        </TabContext>
      </Stack>
    </>
  );
};
