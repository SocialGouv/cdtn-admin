import PropTypes from "prop-types";

export function List({ className, children }) {
  return (
    <ul className={className} sx={{ margin: 0, px: 0 }}>
      {children}
    </ul>
  );
}
List.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function Li({ children }) {
  return <li sx={{ listStyle: "none" }}>{children}</li>;
}
Li.propTypes = {
  children: PropTypes.node,
};
