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

export const EditQuestion = ({
  questionId,
}: EditQuestionProps): JSX.Element => {
  const data = useQuestionQuery({ questionId });
  const [value, setValue] = React.useState("1");

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

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
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
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Réponses" value="1" />
              <Tab label="Édition" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <EditQuestionAnswerList
              answers={data.question.answers}
            ></EditQuestionAnswerList>
          </TabPanel>
          <TabPanel value="2">
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
