import React, { useState } from "react";

import { useListAgreementQuery } from "./list.query";
import { useRouter } from "next/router";
import { Tooltip } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import Filter from "./Filter";
import { DataTable } from "../../../../components/data";

type AgreementData = {
  id: string;
  title: string;
  isSupported: boolean;
};

export const AgreementList = (): JSX.Element => {
  const router = useRouter();
  const [keyword, setKeyword] = useState<string | undefined>();
  const [isSupported, setSupported] = useState<boolean[]>([true, false]);
  const { rows } = useListAgreementQuery({
    keyword,
    isSupported,
  });
  return (
    <DataTable<AgreementData>
      source="conventions_collectives"
      headCells={[
        {
          id: "id",
          dataIndex: "id",
          label: "IDCC",
        },
        {
          id: "supported",
          dataIndex: "isSupported",
          label: "",
          render: (value) => {
            return (
              <>
                {value ? (
                  <Tooltip title="Convention collective traitée par le CDTN">
                    <GavelIcon fontSize="small" />
                  </Tooltip>
                ) : undefined}
              </>
            );
          },
        },
        {
          id: "title",
          dataIndex: "title",
          label: "Titre",
        },
      ]}
      rows={rows.map((row) => ({
        id: row.id ?? "",
        title: row.shortName,
        isSupported: row.isSupported,
      }))}
      onClickItem={(id) => {
        router.push(`/agreements/${id}`);
      }}
      onClickCreation={() => {
        router.push("/agreements/creation");
      }}
      setSearch={(value) => setKeyword(value)}
      customFilters={
        <Filter
          data={["traitée", "non traitée"]}
          onChange={(data) => {
            setSupported(
              data.length > 0
                ? data.map((item) => item === "traitée")
                : [true, false]
            );
          }}
        />
      }
    />
  );
};
