import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import { EnhancedTableToolbar } from "./Toolbard";
import { EnhancedTableHead } from "./Head";
import { Data, HeadCell, Source } from "./type";
import { PublishModal } from "./PublishModal";

type Props<T extends Data> = {
  source: Source;
  readonly headCells: HeadCell<T>[];
  rows: T[];
  onClickItem: (id: string) => void;
  onClickCreation: () => void;
  setSearch: (value: string | undefined) => void;
  customFilters?: React.ReactNode;
};

type ItemCheck = {
  [id: string]: boolean;
};

export const EnhancedTable = <T extends Data>({
  source,
  headCells,
  rows,
  onClickItem,
  onClickCreation,
  setSearch,
  customFilters,
}: Props<T>) => {
  const [itemsCheck, setItemCheck] = useState<ItemCheck>({});
  const [isOpen, showModal] = useState<boolean>(false);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemCheck(
      rows.reduce((acc, item) => {
        acc[item.id] = event.target.checked;
        return acc;
      }, {} as ItemCheck)
    );
  };

  const handleItemCheck = (id: string, checked: boolean) => {
    setItemCheck({
      ...itemsCheck,
      [id]: checked,
    });
  };

  const handleClick = (id: string) => {
    const atLeastOneChecked = Object.values(itemsCheck).some(
      (checked) => checked
    );
    if (atLeastOneChecked) {
      handleItemCheck(id, !itemsCheck[id]);
    } else {
      onClickItem(id);
    }
  };

  const numSelected = (): number => {
    return Object.values(itemsCheck).filter((item) => item).length;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <EnhancedTableToolbar
        numSelected={numSelected()}
        onClickPublish={() => showModal(true)}
        onClickCreation={onClickCreation}
        setSearch={setSearch}
        customFilters={customFilters}
      />
      <TableContainer>
        <Table sx={{ minWidth: 750 }} size="medium">
          <EnhancedTableHead
            headCells={headCells}
            numSelected={numSelected()}
            onSelectAllClick={handleSelectAllClick}
            rowCount={rows.length}
          />
          <TableBody>
            {rows.map((row, index) => {
              const isItemSelected = itemsCheck[row.id] ?? false;
              const labelId = `${source}-table-checkbox-${index}`;

              return (
                <TableRow
                  hover
                  key={row.id}
                  selected={isItemSelected}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={(event) =>
                        handleItemCheck(row.id, event.target.checked)
                      }
                    />
                  </TableCell>
                  {headCells.map((head) => (
                    <TableCell
                      key={head.id}
                      id={labelId}
                      onClick={() => handleClick(row.id)}
                    >
                      {head.render
                        ? head.render(row[head.dataIndex])
                        : (row[head.dataIndex] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {isOpen && (
        <PublishModal
          source={source}
          contents={Object.entries(itemsCheck)
            .filter(([_, value]) => value)
            .map(([key, _]) => {
              const find = rows.find((item) => item.id === key)!!;
              return {
                id: find.id,
                title: find.title,
              };
            })}
          open={isOpen}
          onCancel={() => showModal(false)}
          onClose={() => showModal(false)}
        />
      )}
    </Box>
  );
};
