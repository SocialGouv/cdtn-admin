/** @jsx jsx */
import { jsx } from "theme-ui";

export function List({ children }) {
  return <ul sx={{ px: 0 }}>{children}</ul>;
}

export function Li({ children }) {
  return <li sx={{ listStyle: "none" }}>{children}</li>;
}
