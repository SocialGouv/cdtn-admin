/** @jsx jsx */
import { jsx } from "theme-ui";
import PropTypes from "prop-types";

export function Tabs(props) {
  return (
    <ul
      sx={{
        margin: 0,
        borderBottom: "1px solid",
        borderColor: "neutral",
        px: "large",
        display: "flex",
        justifyContent: "center",
        listStyle: "none",
      }}
      {...props}
    />
  );
}

export function TabItem({ selected, controls, ...props }) {
  return (
    <li
      role="tab"
      sx={{
        marginBottom: "-1px",
        border: "1px solid",
        borderColor: "neutral",
        borderTopLeftRadius: "small",
        borderTopRightRadius: "small",
        borderBottomColor: selected ? "white" : "transparent",
        px: "medium",
        py: "xsmall",
        mx: "xxsmall",
        color: selected ? "primary" : "text",
      }}
      aria-selected={selected}
      aria-controls={controls}
      {...props}
    />
  );
}
TabItem.propTypes = {
  selected: PropTypes.bool,
  controls: PropTypes.string.isRequired,
};
TabItem.defaultProps = {
  selected: false,
};
