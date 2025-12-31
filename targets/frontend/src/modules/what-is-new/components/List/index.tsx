import { useRouter } from "next/router";
import { useState } from "react";

import { DataList } from "src/components/list";
import { useListWhatIsNewMonthsQuery } from "./list.query";

type WhatIsNewMonthRow = {
  id: string;
  title: string;
  period: string;
};

export const WhatIsNewMonthList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const router = useRouter();

  const { rows } = useListWhatIsNewMonthsQuery({ search });

  return (
    <DataList<WhatIsNewMonthRow>
      source="what_is_new"
      headCells={[
        { id: "period", dataIndex: "period", label: "Période" },
        { id: "title", dataIndex: "title", label: "Libellé" },
      ]}
      rows={rows.map((row) => ({
        id: row.id,
        title: row.label,
        period: row.period,
      }))}
      onClickItem={(id) => {
        router.push(`/what-is-new/${id}`);
      }}
      onClickCreation={() => {
        router.push("/what-is-new/creation");
      }}
      setSearch={(value) => setSearch(value)}
    />
  );
};