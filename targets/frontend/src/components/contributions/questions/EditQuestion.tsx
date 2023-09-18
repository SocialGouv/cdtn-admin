import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";
import { EditQuestionAnswerList } from "./EditQuestionAnswerList";

import { EditQuestionForm } from "./EditQuestionForm";
import { useQuestionQuery } from "./Question.query";
import { BreadcrumbLink } from "src/components/utils";
import { statusesMapping } from "../status/data";
import { countAnswersWithStatus, getPercentage } from "../questionList";
import { Answer } from "../type";

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

  if (data === undefined) {
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

  const Header = ({ answers }: { answers: Answer[] }) => (
    <>
      <ol aria-label="breadcrumb" className="fr-breadcrumb__list">
        <BreadcrumbLink href={"/contributions"}>Contributions</BreadcrumbLink>
        <BreadcrumbLink>{data?.question?.content}</BreadcrumbLink>
      </ol>
      <Stack direction="row" alignItems="start" spacing={2}>
        {Object.entries(statusesMapping).map(([status, { text, color }]) => {
          const count = countAnswersWithStatus(answers, status);
          return (
            <Card key={status}>
              <CardContent sx={{ color }}>
                {text}
                <Typography sx={{ fontWeight: "bold" }}>{count}</Typography>
                <span>{getPercentage(count, answers.length)}%</span>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );

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
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  return (
    <Stack
      alignItems="stretch"
      direction="column"
      justifyContent="start"
      spacing={2}
    >
      <Header answers={data.question.answers} />
      <Box sx={{ borderBottom: 1 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="basic tabs example"
        >
          <Tab label="Réponses" {...a11yProps(TabValue.answers)} />
          <Tab label="Édition" {...a11yProps(TabValue.edition)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={TabValue.answers}>
        <EditQuestionAnswerList
          answers={data.question.answers}
        ></EditQuestionAnswerList>
      </TabPanel>
      <TabPanel value={tabIndex} index={TabValue.edition}>
        <EditQuestionForm question={data.question} messages={data.messages} />
      </TabPanel>
    </Stack>
  );
};
