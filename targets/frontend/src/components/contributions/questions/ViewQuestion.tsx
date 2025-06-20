import { Box, Stack, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import { EditQuestion } from "./edit";
import { Answers } from "./answers";
import { Header } from "./Header";

type Props = {
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

export const ViewQuestion = ({ questionId }: Props): JSX.Element => {
  const [tabIndex, setTabIndex] = useState<TabValue>(TabValue.answers);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabValue
  ) => {
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

  return (
    <Stack
      alignItems="stretch"
      direction="column"
      justifyContent="start"
      spacing={2}
    >
      <Header questionId={questionId} />
      <Box sx={{ borderBottom: 1 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Réponses" {...a11yProps(TabValue.answers)} />
          <Tab label="Édition" {...a11yProps(TabValue.edition)} />
        </Tabs>
      </Box>
      <TabPanel value={tabIndex} index={TabValue.answers}>
        <Answers questionId={questionId} />
      </TabPanel>
      <TabPanel value={tabIndex} index={TabValue.edition}>
        <EditQuestion questionId={questionId} />
      </TabPanel>
    </Stack>
  );
};
