/** @jsxImportSource theme-ui */

import * as d3 from "d3";
import { hierarchy, tree } from "d3-hierarchy";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef } from "react";
import { RELATIONS } from "src/lib/relations";
import { Spinner, useThemeUI } from "theme-ui";
import { useQuery } from "urql";

const getThemesQuery = `
query getThemes {
  themeRelations: document_relations(where: {type: {_eq: "${RELATIONS.THEME}"}}) {
    parentId: document_a
    position: data(path: "position")
    theme: b {
      cdtnId: cdtn_id
      title
      document
    }
  }
}
`;

const context = { additionalTypenames: ["documents", "document_relations"] };

export const Map = ({ setShowThemeMap = () => {} }) => {
  const svg = useRef();
  const router = useRouter();
  const { theme } = useThemeUI();

  const [{ fetching, data: { themeRelations = [] } = {} }] = useQuery({
    context,
    query: getThemesQuery,
  });

  const onClickTheme = useCallback(
    (id) => {
      router.push("/themes/[[...id]]", `/themes${id ? `/${id}` : ""}`);
      setShowThemeMap(false);
    },
    [router, setShowThemeMap]
  );

  useEffect(() => {
    buildMap({ onClickTheme, svg: svg.current, theme, themeRelations });
  }, [themeRelations, onClickTheme, theme]);

  if (fetching) return <Spinner />;

  return (
    <svg ref={svg} overflow="visible">
      <g className="root" fontSize="18">
        <g className="links" fill="none" strokeOpacity="0.6" strokeWidth="3" />
        <g className="nodes" sx={{ cursor: "pointer" }} />
      </g>
    </svg>
  );
};

Map.propTypes = {
  setShowThemeMap: PropTypes.func,
};

/* D3 Related stuff */

const MAX_DEPTH = 20;
const NODE_VERTICAL_DISTANCE = 40;
const NODE_HORIZONTAL_DISTANCE = 300;

/* beware, this one is recursive */
const buildChildren = ({ parentId, relations, depth = 0 }) =>
  MAX_DEPTH > 20
    ? []
    : relations
        .filter((relation) => relation.parentId === parentId)
        .sort(({ position: a }, { position: b }) => a - b)
        .map(({ theme }) => ({
          children: buildChildren({
            depth: depth + 1,
            parentId: theme.cdtnId,
            relations,
          }),
          id: theme.cdtnId,
          name: theme.document.shortTitle || theme.title,
        }));

const buildMap = ({ theme, onClickTheme, themeRelations, svg }) => {
  const treeData = {
    children: buildChildren({
      depth: 0,
      parentId: null,
      relations: themeRelations,
    }),
    name: "Thèmes",
  };

  const structuredData = hierarchy(treeData);

  const structuredTree = tree().nodeSize([
    NODE_VERTICAL_DISTANCE,
    NODE_HORIZONTAL_DISTANCE,
  ])(structuredData);

  let x0 = Infinity;
  let x1 = -x0;
  structuredTree.each((d) => {
    if (d.x > x1) x1 = d.x;
    if (d.x < x0) x0 = d.x;
  });

  const canvas = d3
    .select(svg)
    .attr(
      "width",
      `${(structuredData.height + 1) * NODE_HORIZONTAL_DISTANCE}px`
    )
    .attr("viewBox", [
      0,
      0,
      (structuredData.height + 1) * NODE_HORIZONTAL_DISTANCE,
      x1 - x0 + NODE_VERTICAL_DISTANCE * 2,
    ]);

  const g = canvas
    .select("g.root")
    .attr(
      "transform",
      `translate(${NODE_HORIZONTAL_DISTANCE / 3},${
        NODE_VERTICAL_DISTANCE - x0
      })`
    );

  g.select("g.links")
    .selectAll("path")
    .data(structuredTree.links())
    .join("path")
    .attr("stroke", theme.colors.primary)
    .attr(
      "d",
      d3
        .linkHorizontal()
        .x((d) => d.y)
        .y((d) => d.x)
    );

  const node = g
    .select("g.nodes")
    .selectAll("g")
    .data(structuredTree.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.y},${d.x})`)
    .on("mouseenter", function () {
      const node = d3.select(this);
      node
        .transition()
        .attr("transform", (d) => `translate(${d.y},${d.x}), scale(1.1)`);
    })
    .on("mouseleave", function () {
      const node = d3.select(this);
      node.transition().attr("transform", (d) => `translate(${d.y},${d.x})`);
    })
    .on("click", function () {
      const id = d3.select(this).data()[0].data.id;
      onClickTheme(id);
    });

  node
    .append("circle")
    .attr("stroke", theme.colors.neutral)
    .attr("stroke-width", 3)
    .attr("fill", theme.colors.secondary)
    .attr("r", "6px");

  node
    .append("text")
    .attr("dy", "0.3rem")
    .attr("fill", theme.colors.text)
    .attr("stroke-line-join", "round")
    .attr("stroke-width", 3)
    .attr("y", (d) => (d.depth % 2 === 1 ? -20 : 20))
    .attr("text-anchor", "middle")
    .text((d) => d.data.name)
    .clone(true)
    .lower()
    .attr("stroke", "white");
};
