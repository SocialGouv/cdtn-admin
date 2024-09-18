import * as React from "react";
import { Theme, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

type Props = {
  data: string[];
  onChange: (values: string[]) => void;
};

export default function Filter({ data, onChange }: Props) {
  const theme = useTheme();
  const [items, setItems] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof items>) => {
    const {
      target: { value },
    } = event;
    const values = typeof value === "string" ? value.split(",") : value;
    setItems(values);
    onChange(values);
  };

  return (
    <FormControl sx={{ width: 200, marginX: "8px" }} size="small">
      <InputLabel id="multiple-chip-label">Statut</InputLabel>
      <Select
        labelId="multiple-chip-label"
        id="multiple-chip"
        multiple
        value={items}
        onChange={handleChange}
        input={<OutlinedInput id="select-multiple-chip" label="Statut" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} size="small" />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        {data.map((name) => (
          <MenuItem
            key={name}
            value={name}
            style={getStyles(name, items, theme)}
          >
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
