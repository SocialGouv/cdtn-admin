/** @jsx jsx */
import PropTypes from "prop-types";
import { jsx } from "theme-ui";

export function Tabs(props) {
  return (
    <ul
      sx={{
        borderBottom: "1px solid",
        borderColor: "neutral",
        display: "flex",
        justifyContent: "center",
        listStyle: "none",
        margin: 0,
        px: "large",
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
        border: "1px solid",
        borderBottomColor: selected ? "white" : "transparent",
        borderColor: "neutral",
        borderTopLeftRadius: "small",
        borderTopRightRadius: "small",
        color: selected ? "primary" : "text",
        marginBottom: "-1px",
        mx: "xxsmall",
        px: "medium",
        py: "xsmall",
      }}
      aria-selected={selected}
      aria-controls={controls}
      {...props}
    />
  );
}
TabItem.propTypes = {
  controls: PropTypes.string.isRequired,
  selected: PropTypes.bool,
};
TabItem.defaultProps = {
  selected: false,
};
