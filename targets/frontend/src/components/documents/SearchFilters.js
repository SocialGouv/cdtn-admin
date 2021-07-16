import { getLabelBySource, SOURCES } from "@socialgouv/cdtn-sources";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { IoMdSearch } from "react-icons/io";
import { Box, Input, Label, Radio, Select } from "theme-ui";
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
      [event.target.name]: event.target.value,
    });
  }

  function onSubmit(data) {
    onSearchUpdate(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Inline>
        <Input
          sx={{ flex: 1 }}
          {...register("q")}
          type="search"
          placeholder="titre..."
          defaultValue={initialValues.q}
          onBlur={triggerUpdateUrl}
        />
        <Select
          {...register("source")}
          onChange={triggerUpdateUrl}
          defaultValue={initialValues.source || ""}
        >
          <option value="">toutes les sources</option>
          {documentSources.map(([source, label]) => (
            <option
              key={source}
              value={source}
              disabled={isSourceDisabled(source)}
            >
              {label}
            </option>
          ))}
        </Select>
        <Button>
          <IoMdSearch /> Rechercher
        </Button>
        <Box sx={{ alignSelf: "flex-end" }}>
          <Label
            htmlFor="itemsPerPage"
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Select
              sx={{ width: "4rem" }}
              {...register("itemsPerPage")}
              id="itemsPerPage"
              defaultValue={initialValues.itemsPerPage}
              onChange={triggerUpdateUrl}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={`items-per-page${size}`} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </Label>
        </Box>
      </Inline>
      <Inline paddingTop="xsmall">
        <Inline sx="margin-right: 1rem">
          Publication :
          <Label sx={{ cursor: "pointer" }}>
            <Radio
              {...register("published")}
              value="all"
              defaultChecked={initialValues.published === "all"}
              onChange={triggerUpdateUrl}
            />
            Tous{" "}
          </Label>
          <Label sx={{ cursor: "pointer" }}>
            <Radio
              {...register("published")}
              value="yes"
              defaultChecked={initialValues.published === "yes"}
              onChange={triggerUpdateUrl}
            />
            Publié{" "}
          </Label>
          <Label sx={{ cursor: "pointer" }}>
            <Radio
              {...register("published")}
              value="no"
              defaultChecked={initialValues.published === "no"}
              onChange={triggerUpdateUrl}
            />
            Non-publié{" "}
          </Label>
        </Inline>
        Status :
        <Label sx={{ cursor: "pointer" }}>
          <Radio
            {...register("available")}
            value="all"
            defaultChecked={initialValues.available === "all"}
            onChange={triggerUpdateUrl}
          />
          Tous{" "}
        </Label>
        <Label sx={{ cursor: "pointer" }}>
          <Radio
            {...register("available")}
            value="yes"
            defaultChecked={initialValues.available === "yes"}
            onChange={triggerUpdateUrl}
          />
          Disponible{" "}
        </Label>
        <Label sx={{ cursor: "pointer" }}>
          <Radio
            {...register("available")}
            value="no"
            defaultChecked={initialValues.available === "no"}
            onChange={triggerUpdateUrl}
          />
          Supprimé{" "}
        </Label>
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
