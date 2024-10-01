import { useRouter } from "next/router";
import { useState } from "react";

import { useListModelQuery } from "./list.query";
import { DataTable } from "../../../../components/data";

type ModelData = {
  id: string;
  title: string;
};

export const ModelList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const { rows } = useListModelQuery({
    search,
  });
  return (
    <DataTable<ModelData>
      source="modeles_de_courriers"
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
        router.push(`/models/${id}`);
      }}
      onClickCreation={() => {
        router.push("/models/creation");
      }}
      setSearch={(value) => setSearch(value)}
    />
  );
};
