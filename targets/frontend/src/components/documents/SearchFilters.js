import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { IoMdSearch } from "react-icons/io";
import {
  Box,
  Input,
  Select,
  Radio,
  FormControlLabel,
  FormLabel,
  MenuItem,
} from "@mui/material";
import { useQuery } from "urql";

import { Button } from "../button";
import { Inline } from "../layout/Inline";

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
  const [result] = useQuery({
    query: sourceQuery,
    variables: {
      available:
        initialValues.available === "yes"
          ? [true]
          : initialValues.available === "no"
          ? [false]
          : [true, false],
      published:
        initialValues.published === "yes"
          ? [true]
          : initialValues.published === "no"
          ? [false]
          : [true, false],
      search: `%${initialValues.q}%`,
      source: initialValues.source || null,
    },
  });

  const { data } = result;
  function isSourceDisabled(source) {
    return (
      data?.sources.nodes.find((node) => node.source === source) === undefined
    );
  }

  function triggerUpdateUrl(event) {
    console.log("update filters");
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
      <Inline paddingTop="20px" paddingLeft="20px">
        <Input
          sx={{ flex: 1, width: "200px", marginRight: "15px" }}
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
          <MenuItem value={"no-filter"}>toutes les sources</MenuItem>
          {documentSources.map(([source, label]) => (
            <MenuItem
              key={source}
              value={source}
              disabled={isSourceDisabled(source)}
            >
              {label}
            </MenuItem>
          ))}
        </Select>
        <Button sx={{ marginLeft: "20px" }}>
          <IoMdSearch style={{ marginRight: "5px" }} /> Rechercher
        </Button>
        <Box sx={{ alignSelf: "flex-end", marginLeft: "20px" }}>
          <div
            htmlFor="itemsPerPage"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
      </Inline>
      <Inline paddingTop="20px" paddingLeft="20px" paddingBottom="10px">
        <Inline>
          <FormLabel>Publication :</FormLabel>
          <div sx={{ cursor: "pointer" }}>
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
          </div>
          <div sx={{ cursor: "pointer" }}>
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
          </div>
          <div sx={{ cursor: "pointer" }}>
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
          </div>
        </Inline>
        <FormLabel>Status :</FormLabel>
        <div sx={{ cursor: "pointer" }}>
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
        </div>
        <div sx={{ cursor: "pointer" }}>
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
        </div>
        <div sx={{ cursor: "pointer" }}>
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
        </div>
      </Inline>
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

const sourceQuery = `
query documents($source: String, $search: String!, $published: [Boolean!]!,  $available: [Boolean!]!) {
  sources:   documents_aggregate(where: {
    _not: {
      document: {_has_key: "split"}
    }
    _and: {
      source: {_eq: $source, _neq: "code_du_travail"}
      title: {_ilike: $search},
      is_published: {_in: $published}
      is_available: {_in: $available}  
    }
  }) {
    nodes {
      source
    }
  }
}
`;
