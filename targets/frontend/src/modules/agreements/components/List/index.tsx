import {
  Button,
  FormControlLabel,
  FormGroup,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useState } from "react";

import { useListAgreementQuery } from "./list.query";
import { Row } from "./Row";
import { useRouter } from "next/router";

export const AgreementList = (): JSX.Element => {
  const router = useRouter();
  const [idcc, setIdcc] = useState<string | undefined>();
  const [keyword, setKeyword] = useState<string | undefined>();
  const [isSupported, setSupported] = useState<boolean>(false);
  const { rows } = useListAgreementQuery({
    idcc,
    keyword,
    isSupported,
  });
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <FormGroup row={true}>
          <TextField
            label="IDCC"
            variant="outlined"
            onChange={(event) => {
              const value = event.target.value;
              setIdcc(value ? `%${value}%` : undefined);
            }}
            data-testid="agreements-idcc-search"
          />
          <TextField
            label="Recherche mot clé"
            variant="outlined"
            onChange={(event) => {
              const value = event.target.value;
              setKeyword(value ? `%${value}%` : undefined);
            }}
            data-testid="agreements-keyword-search"
          />

          <FormControlLabel
            control={
              <Switch
                onChange={(event) => {
                  // console.log(`Value: ${value.target.value}`);
                  setSupported(event.target.checked);
                }}
                checked={isSupported}
              />
            }
            labelPlacement="start"
            label="Afficher que les supportés"
          />
        </FormGroup>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            router.push("/agreements/creation");
          }}
        >
          Créer
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>IDCC</TableCell>
              <TableCell></TableCell>
              <TableCell>Titre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row row={row} key={row.id} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
