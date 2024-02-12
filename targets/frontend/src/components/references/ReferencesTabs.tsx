import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { CustomTabPanel } from "./CustomTabPanel";

type Props = {
  firstTabTitle: string;
  secondTabTitle: string;
  firstChildren: React.ReactNode;
  secondChildren: React.ReactNode;
};

export function ReferencesTabs(props: Props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab
            id={"simple-tab-0"}
            label={props.firstTabTitle}
            aria-controls="simple-tabpanel-0"
          />
          <Tab
            id={"simple-tab-1"}
            label={props.secondTabTitle}
            aria-controls="simple-tabpanel-1"
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        {props.firstChildren}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {props.secondChildren}
      </CustomTabPanel>
    </Box>
  );
}
