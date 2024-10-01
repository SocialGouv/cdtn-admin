import { useState } from "react";
import { useRouter } from "next/router";

import { useInformationsListQuery } from "./list.query";
import { DataTable } from "../../../../components/data";

type InfoData = {
  id: string;
  title: string;
};

export const InformationList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const { rows } = useInformationsListQuery({
    search,
  });

  return (
    <DataTable<InfoData>
      source="information"
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
        router.push(`/informations/${id}`);
      }}
      onClickCreation={() => {
        router.push("/informations/creation");
      }}
      setSearch={(value) => setSearch(value)}
    />
  );
};
