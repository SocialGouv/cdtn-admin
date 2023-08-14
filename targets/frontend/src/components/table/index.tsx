import { ComponentPropsWithoutRef } from "react";
import { theme } from "src/theme";

export const Table = (props: ComponentPropsWithoutRef<"table">) => (
  <table
    style={{
      borderCollapse: "collapse",
      borderRadius: "small",
      overflow: "hidden",
      width: "100%",
    }}
    {...props}
  />
);

export const Tr = (props: ComponentPropsWithoutRef<"tr">) => <tr {...props} />;

export type CellAlign = {
  align?: "left" | "right" | "center";
};

export const Th = ({
  align = "left",
  ...props
}: ComponentPropsWithoutRef<"th"> & CellAlign) => (
  <th
    style={{
      borderBottom: "1px solid",
      fontSize: theme.fontSizes.medium,
      fontWeight: theme.fontWeights.semibold,
      padding: theme.space.xsmall,
      textAlign: align,
    }}
    {...props}
  />
);

export const Td = ({
  align = "left",
  ...props
}: ComponentPropsWithoutRef<"td"> & CellAlign) => (
  <td
    style={{
      fontWeight: 300,
      paddingLeft: "xsmall",
      paddingRight: "xsmall",
      paddingTop: "xxsmall",
      paddingBottom: "xxsmall",
      textAlign: align,
    }}
    {...props}
  />
);
