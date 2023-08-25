import PropTypes from "prop-types";
import { IoMdClose } from "react-icons/io";
import { IconButton } from "src/components/button";
import { Box, List as Ul, ListItem, Stack } from "@mui/material";
import { theme } from "src/theme";

export const List = ({
  disabled = false,
  entries = [],
  onDeleteEntry = () => {},
}) => {
  return (
    <Ul
      sx={{
        borderRadius: theme.space.xsmall,
        listStyleType: "none",
        m: "0",
        p: 0,
      }}
    >
      {entries.map((entry) => (
        <ListItem
          key={entry}
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            m: 0,
            p: 0,
          }}
        >
          <Box sx={{ display: "flex" }}>
            {!disabled && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                mr={theme.space.xxsmall}
              >
                <IconButton
                  sx={{ flex: "0 0 auto", padding: theme.space.small }}
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    onDeleteEntry(entry);
                  }}
                >
                  <IoMdClose
                    sx={{ flex: "1 0 auto", height: "1rem", width: "1rem" }}
                  />
                </IconButton>
              </Box>
            )}
            <Box
              style={{
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
              }}
            >{`${entry}`}</Box>
          </Box>
        </ListItem>
      ))}
    </Ul>
  );
};

List.propTypes = {
  disabled: PropTypes.bool,
  entries: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDeleteEntry: PropTypes.func.isRequired,
};
