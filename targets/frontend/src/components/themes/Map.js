/** @jsx jsx  */

import * as d3 from "d3";
import { hierarchy, tree } from "d3-hierarchy";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef } from "react";
import { jsx, Spinner, useThemeUI } from "theme-ui";
import { useQuery } from "urql";

const getThemesQuery = `
query getThemes {
  theme_relations(
    where: {}
    order_by: {
      position: asc
    }
  ) {
    isWeak: is_weak
    parentId: parent
    child: child_theme {
      id
      isSpecial: is_special
      title
      shortTitle: short_title
    }
  }
}
`;

const context = { additionalTypenames: ["themes", "theme_relations"] };

export const Map = ({ setShowThemeMap = () => {} }) => {
  const svg = useRef();
  const router = useRouter();
  const { theme } = useThemeUI();

  const [
    { fetching, data: themeRelationsData = { theme_relations: [] } },
  ] = useQuery({
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
    buildMap({ onClickTheme, svg: svg.current, theme, themeRelationsData });
  }, [themeRelationsData, onClickTheme, theme]);

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
const NODE_VERTICAL_DISTANCE = 75;
const NODE_HORIZONTAL_DISTANCE = 300;

/* beware, this one is recursive */
const buildChildren = ({ parentId, relations, depth = 0 }) =>
  MAX_DEPTH > 20
    ? []
    : relations
        .filter((relation) => relation.parentId === parentId)
        .map(({ isWeak, child }) => ({
          children: buildChildren({
            depth: depth + 1,
            parentId: child.id,
            relations,
          }),
          id: child.id,
          isRelationWeak: isWeak,
          isSpecial: child.isSpecial,
          name: child.shortTitle || child.title,
        }));

const buildMap = ({ theme, onClickTheme, themeRelationsData, svg }) => {
  const treeData = {
    children: buildChildren({
      depth: 0,
      parentId: null,
      relations: themeRelationsData.theme_relations,
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
    .attr("stroke", (d) =>
      d.target.data.isRelationWeak
        ? theme.colors.secondary
        : theme.colors.primary
    )
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
    .attr("stroke-width", 6)
    .attr("fill", (d) =>
      d.data.isSpecial ? theme.colors.primary : theme.colors.secondary
    )
    .attr("r", "15px");

  node
    .append("text")
    .attr("dy", "0.3rem")
    .attr("fill", theme.colors.text)
    .attr("stroke-line-join", "round")
    .attr("stroke-width", 3)
    .attr("y", (d) => (d.depth % 2 === 1 ? -30 : 30))
    .attr("text-anchor", "middle")
    .text((d) => d.data.name)
    .clone(true)
    .lower()
    .attr("stroke", "white");
};
