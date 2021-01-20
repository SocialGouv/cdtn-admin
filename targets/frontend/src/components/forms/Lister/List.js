import PropTypes from "prop-types";
import { IoMdClose } from "react-icons/io";
import { IconButton } from "src/components/button";
import { Box, Flex } from "theme-ui";

export const List = ({
  disabled = false,
  entries = [],
  onDeleteEntry = () => {},
}) => {
  return (
    <ul
      sx={{
        backgroundColor: "#f9f9f9",
        borderRadius: "small",
        listStyleType: "none",
        m: "0",
        mt: "xxsmall",
        p: "0.4rem",
      }}
    >
      {entries.map((entry) => (
        <li
          key={entry}
          sx={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Flex>
            {!disabled && (
              <Flex
                sx={{
                  mr: "xxsmall",
                }}
              >
                <IconButton
                  sx={{ flex: "0 0 auto", padding: "small" }}
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
              </Flex>
            )}
            <Box>{`${entry}`}</Box>
          </Flex>
        </li>
      ))}
    </ul>
  );
};

List.propTypes = {
  disabled: PropTypes.bool,
  entries: PropTypes.arrayOf(PropTypes.string).isRequired,
  onDeleteEntry: PropTypes.func.isRequired,
};
