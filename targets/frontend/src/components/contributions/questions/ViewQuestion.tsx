import { Box, Stack, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { EditQuestion } from "./edit";
import { Answers } from "./answers";
import { Header } from "./Header";
import { QuestionStatistics } from "./statistics";

type Props = {
  questionId: string;
};

enum TabValue {
  answers = 0,
  edition = 1,
  statistiques = 2,
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: TabValue;
  value: TabValue;
}

export const ViewQuestion = ({ questionId }: Props): JSX.Element => {
  const [tabIndex, setTabIndex] = useState<TabValue>(TabValue.answers);

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
        style={{ width: "100%" }} // important
      >
        {value === index && (
          <Box
            sx={{
              p: 3,
              width: "100%",
              // Pas de hauteur fixe, on laisse pousser
            }}
          >
            {children}
          </Box>
        )}
      </div>
    );
  }

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        minHeight: "100vh", // prend toute la hauteur de l'écran
        width: "100%",
        pb: 4, // marge basse
      }}
    >
      <Header questionId={questionId} />

      <Box sx={{ borderBottom: 1, width: "100%" }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Réponses" {...a11yProps(TabValue.answers)} />
          <Tab label="Édition" {...a11yProps(TabValue.edition)} />
          <Tab label="Statistiques" {...a11yProps(TabValue.statistiques)} />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, width: "100%" }}>
        {" "}
        {/* ← CLÉ : prend tout l’espace restant */}
        <TabPanel value={tabIndex} index={TabValue.answers}>
          <Answers questionId={questionId} />
        </TabPanel>
        <TabPanel value={tabIndex} index={TabValue.edition}>
          <EditQuestion questionId={questionId} />
        </TabPanel>
        <TabPanel value={tabIndex} index={TabValue.statistiques}>
          <QuestionStatistics questionId={questionId} />
        </TabPanel>
      </Box>
    </Stack>
  );
};
