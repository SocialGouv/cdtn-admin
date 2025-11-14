import { useRouter } from "next/router";
import { useState } from "react";

import { useListInfographicQuery } from "./list.query";
import { DataList } from "../../../../components/list";

type InfographicData = {
  id: string;
  title: string;
};

export const InfographicList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const { rows } = useListInfographicQuery({
    search,
  });
  return (
    <DataList<InfographicData>
      source="infographies"
      headCells={[
        {
          id: "id",
          dataIndex: "title",
          label: "Titre",
        },
      ]}
      rows={rows.map((row) => ({
        id: row.id ?? "",
        title: row.title,
      }))}
      onClickItem={(id) => {
        router.push(`/infographics/${id}`);
      }}
      onClickCreation={() => {
        router.push("/infographics/creation");
      }}
      setSearch={(value) => setSearch(value)}
    />
  );
};
