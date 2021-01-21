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
import { Alert, Card, Flex, Text } from "theme-ui";

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
        <Alert variant="highlight" sx={{ mb: "small" }}>
          <Text sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Il n’y a aucun thème pour le moment !
          </Text>
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
  <ol sx={{ m: 0, p: 0 }}>
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
    sx={{
      alignItems: "stretch",
      display: "flex",
      justifyContent: "stretch",
      mb: "small",
    }}
  >
    {isAdmin && sortable && <SortHandle />}
    <Link href={`/themes/${theme.cdtnId}`} passHref>
      <Card
        as="a"
        sx={{
          ":hover": { boxShadow: "cardHover" },
          ":link, :visited": { color: "text" },
          color: "text",
          cursor: "pointer",
          display: "block",
          flex: 1,
          justifyContent: "space-between",
          textDecoration: "none",
        }}
      >
        <Flex
          sx={{
            alignItems: "center",
            fontSize: "1.2rem",
            justifyContent: "space-between",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {theme.title}
          <IoIosArrowDroprightCircle
            sx={{
              color: "secondary",
              height: "iconMedium",
              ml: "small",
              width: "iconMedium",
            }}
          />
        </Flex>
      </Card>
    </Link>
  </li>
));

const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    sx={{ cursor: "grab", height: "auto", mr: "xsmall" }}
  >
    <IoIosReorder sx={{ height: "iconMedium", width: "iconMedium" }} />
  </IconButton>
));
