import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-utils";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { IoMdSearch } from "react-icons/io";
import {
  Box,
  FormControlLabel,
  FormLabel,
  Input,
  MenuItem,
  Radio,
  Select,
  Stack,
} from "@mui/material";

import { Button } from "../button";

export const DEFAULT_ITEMS_PER_PAGE = 25;

export function SearchFilters({ initialValues, onSearchUpdate }) {
  const documentSources = [
    [SOURCES.CCN, getLabelBySource(SOURCES.CCN)],
    // there is too many cdt documents which pollute the output
    // [SOURCES.CDT, getLabelBySource(SOURCES.CDT)],
    [SOURCES.CONTRIBUTIONS, getLabelBySource(SOURCES.CONTRIBUTIONS)],
    [SOURCES.SHEET_MT_PAGE, getLabelBySource(SOURCES.SHEET_MT)],
    [SOURCES.SHEET_SP, getLabelBySource(SOURCES.SHEET_SP)],
    [SOURCES.EDITORIAL_CONTENT, getLabelBySource(SOURCES.EDITORIAL_CONTENT)],
    [SOURCES.THEMATIC_FILES, getLabelBySource(SOURCES.THEMATIC_FILES)],
    [SOURCES.LETTERS, getLabelBySource(SOURCES.LETTERS)],
    [SOURCES.EXTERNALS, getLabelBySource(SOURCES.EXTERNALS)],
    [SOURCES.TOOLS, getLabelBySource(SOURCES.TOOLS)],
    [SOURCES.HIGHLIGHTS, getLabelBySource(SOURCES.HIGHLIGHTS)],
    [SOURCES.PREQUALIFIED, getLabelBySource(SOURCES.PREQUALIFIED)],
  ];

  const { handleSubmit, register } = useForm();

  function triggerUpdateUrl(event) {
    onSearchUpdate({
      ...initialValues,
      [event.target.name]:
        event.target.value === "no-filter" ? "" : event.target.value,
    });
  }

  function onSubmit(data) {
    onSearchUpdate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="row" spacing={2} p={2}>
        <Input
          sx={{ flex: 1, width: "100px", marginRight: "15px" }}
          {...register("q")}
          type="search"
          placeholder="Titre..."
          defaultValue={initialValues.q}
          onBlur={triggerUpdateUrl}
        />
        <Select
          {...register("source")}
          onChange={triggerUpdateUrl}
          value={initialValues.source || "no-filter"}
          sx={{ marginRight: "15px" }}
        >
          <MenuItem value={"no-filter"}>Toutes les sources</MenuItem>
          {documentSources.map(([source, label]) => (
            <MenuItem key={source} value={source}>
              {label}
            </MenuItem>
          ))}
        </Select>
        <Button sx={{ marginLeft: "20px" }}>
          <IoMdSearch style={{ marginRight: "5px" }} /> Rechercher
        </Button>
        <Box sx={{ alignSelf: "flex-end", marginLeft: "20px" }}>
          <div htmlFor="itemsPerPage">
            <Select
              {...register("itemsPerPage")}
              id="itemsPerPage"
              defaultValue={initialValues.itemsPerPage}
              onChange={triggerUpdateUrl}
            >
              {[10, 25, 50, 100].map((size) => (
                <MenuItem key={`items-per-page${size}`} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </div>
        </Box>
      </Stack>
      <Stack direction="row" spacing={8} p={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormLabel>Publication :</FormLabel>
          <FormControlLabel
            value="all"
            control={
              <Radio
                {...register("published")}
                checked={initialValues.published === "all"}
                onChange={triggerUpdateUrl}
              />
            }
            label="Tous"
          />
          <FormControlLabel
            value="yes"
            control={
              <Radio
                {...register("published")}
                checked={initialValues.published === "yes"}
                onChange={triggerUpdateUrl}
              />
            }
            label="Publié"
          />
          <FormControlLabel
            value="no"
            control={
              <Radio
                {...register("published")}
                checked={initialValues.published === "no"}
                onChange={triggerUpdateUrl}
              />
            }
            label="Non-publié"
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2} mt={2}>
          <FormLabel>Status :</FormLabel>
          <FormControlLabel
            value="all"
            control={
              <Radio
                {...register("available")}
                checked={initialValues.available === "all"}
                onChange={triggerUpdateUrl}
              />
            }
            label="Tous"
          />
          <FormControlLabel
            value="yes"
            control={
              <Radio
                {...register("available")}
                checked={initialValues.available === "yes"}
                onChange={triggerUpdateUrl}
              />
            }
            label="Disponible"
          />
          <FormControlLabel
            value="no"
            control={
              <Radio
                {...register("available")}
                checked={initialValues.available === "no"}
                onChange={triggerUpdateUrl}
              />
            }
            label="Supprimé"
          />
        </Stack>
      </Stack>
    </form>
  );
}

SearchFilters.propTypes = {
  initialValues: PropTypes.shape({
    avai: PropTypes.oneOf(["all", "yes", "no"]),
    itemsPerPage: PropTypes.number,
    published: PropTypes.oneOf(["all", "yes", "no"]),
    q: PropTypes.string,
    source: PropTypes.string,
  }),
  onSearchUpdate: PropTypes.func.isRequired,
};
