/** jsxImportSource theme-ui */ import PropTypes from "prop-types";

export function Tabs(props) {
  return (
    <ul
      sx={{
        borderBottom: "1px solid",
        borderColor: "neutral",
        display: "flex",
        justifyContent: "flex-start",
        listStyle: "none",
        margin: 0,
        px: "xxsmall",
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
        borderColor: "neutral",
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        borderBottomColor: selected ? "white" : "transparent",
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
