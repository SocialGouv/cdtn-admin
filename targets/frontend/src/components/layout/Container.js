/** @jsxImportSource theme-ui */

export function Container(props) {
  return (
    <div
      {...props}
      sx={{
        maxWidth: "container",
        mx: "auto",
        px: ["none", "medium", "xxlarge"],
      }}
    />
  );
}
