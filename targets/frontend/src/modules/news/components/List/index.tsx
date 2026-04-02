import { useRouter } from "next/router";
import { useState } from "react";

import { useListNewsQuery } from "./list.query";
import { DataList } from "../../../../components/list";

type NewsData = {
  id: string;
  title: string;
};

export const NewsList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();
  const { rows } = useListNewsQuery({
    search,
  });
  return (
    <DataList<NewsData>
      source="actualites"
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
        router.push(`/news/${id}`);
      }}
      onClickCreation={() => {
        router.push("/news/creation");
      }}
      setSearch={(value) => setSearch(value)}
    />
  );
};
