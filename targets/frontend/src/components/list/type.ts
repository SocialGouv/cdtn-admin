import { SourceKeys } from "@socialgouv/cdtn-utils";

export type Data = {
  id: string;
  title: string;
  [key: string]: unknown;
};

export type HeadCell<T extends Data> = {
  id: string;
  dataIndex: keyof T;
  label: string;
  render?: (value: T[HeadCell<T>["dataIndex"]]) => React.ReactNode;
};

export type Source =
  | "information"
  | "modeles_de_courriers"
  | "contributions"
  | "conventions_collectives"
  | "infographics";
