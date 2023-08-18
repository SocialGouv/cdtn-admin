import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoIosArrowDroprightCircle, IoIosReorder } from "react-icons/io";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { IconButton } from "src/components/button";
import { useUser } from "src/hooks/useUser";
import { Alert, Card, Box } from "@mui/material";
import { theme as th } from "../../theme";

const formatRelationsIntoThemes = (relations = []) =>
  relations
    .sort(({ position: a }, { position: b }) => a - b)
    .map(({ id, child }) => ({
      relationId: id,
      ...child,
    }));

const List = ({ relations, updateThemesPosition }) => {
  const { isAdmin } = useUser();
  // Prevent visual glitch when reordering themes
  const [displayedThemes, setDisplayedThemes] = useState(
    formatRelationsIntoThemes(relations)
  );
  useEffect(() => {
    setDisplayedThemes(formatRelationsIntoThemes(relations));
  }, [relations]);

  return (
    <>
      {displayedThemes.length === 0 ? (
        <Alert severity="success" sx={{ mb: "small" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Il n’y a aucun thème pour le moment !
          </p>
        </Alert>
      ) : (
        <ThemeList
          themes={displayedThemes}
          isAdmin={isAdmin}
          useDragHandle={true}
          lockAxis="y"
          onSortEnd={({ oldIndex, newIndex }) => {
            displayedThemes.splice(
              newIndex,
              0,
              displayedThemes.splice(oldIndex, 1)[0]
            );
            updateThemesPosition({
              objects: displayedThemes.map((theme, index) => ({
                data: { position: index },
                document_b: theme.cdtnId,
                id: theme.relationId,
                type: "theme",
              })),
            });
            // prevent visual glitch when reordering
            setDisplayedThemes(displayedThemes);
          }}
        />
      )}
    </>
  );
};
List.propTypes = {
  relations: PropTypes.array,
  updateThemesPosition: PropTypes.func.isRequired,
};

export { List };

const ThemeList = SortableContainer(({ themes, ...props }) => (
  <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
    {themes.map((theme, index) => (
      <ThemeRow
        key={theme.cdtnId}
        index={index}
        theme={theme}
        sortable={themes.length > 1}
        {...props}
      />
    ))}
  </ol>
));

const ThemeRow = SortableElement(({ isAdmin, sortable, theme }) => (
  <li
    style={{
      alignItems: "stretch",
      display: "flex",
      justifyContent: "stretch",
      marginBottom: th.space.small,
    }}
  >
    {isAdmin && sortable && <SortHandle />}
    <Link
      href={`/themes/${theme.cdtnId}`}
      passHref
      style={{ textDecoration: "none" }}
    >
      <Card
        style={{
          ":hover": { boxShadow: "cardHover" },
          ":link, :visited": { color: "text" },
          color: "text",
          cursor: "pointer",
          display: "block",
          flex: 1,
          justifyContent: "space-between",
          textDecoration: "none",
          padding: "30px",
          width: "fit-content",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            fontSize: "1.2rem",
            justifyContent: "space-between",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "flex",
          }}
        >
          {theme.title}
          <IoIosArrowDroprightCircle
            style={{
              height: th.sizes.iconMedium,
              marginLeft: th.space.small,
              width: th.sizes.iconMedium,
            }}
          />
        </Box>
      </Card>
    </Link>
  </li>
));

const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    style={{ cursor: "grab", height: "auto", mr: th.space.xsmall }}
  >
    <IoIosReorder
      style={{ height: th.sizes.iconMedium, width: th.sizes.iconMedium }}
    />
  </IconButton>
));
