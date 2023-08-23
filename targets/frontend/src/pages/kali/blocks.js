import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { IoMdSave } from "react-icons/io";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Card, Select, Alert, InputLabel, MenuItem } from "@mui/material";
import { useMutation, useQuery } from "urql";
import { theme as th } from "../../theme";

const searchKaliDocumentQuery = `

query KaliDocumentQuery {
  kali_blocks(order_by: {title: asc}) {
    id
    idcc
    title
    blocks
  }
}

`;

const editKaliBlocksMutation = `
mutation EditBlocks(
  $id: String!,
  $blocks: jsonb!,
) {
  update_kali_blocks_by_pk(
    pk_columns: {id: $id},
    _set: {
      blocks: $blocks
    }) {
    id: id
  }
}
`;

// todo: move somewhere ?
// d'après la note DGT "DGT - Fiche 2018-29 - Ordonnances 2017 -Fiche Hiérarchie des normes"
const blocksDefinition = [
  { id: 1, label: `Bloc 1 : Salaires minima hiérarchiques` },
  { id: 2, label: `Bloc 2 : Classifications` },
  {
    id: 3,
    label: `Bloc 3 : Mutualisation des fonds de financement du paritarisme`,
  },
  {
    id: 4,
    label: `Bloc 4 : Mutualisation des fonds de la formation professionnelle`,
  },
  { id: 5, label: `Bloc 5 : Prévoyance` },
  {
    id: 6,
    label: `Bloc 6 : Durée du travail, répartition et aménagement des horaires`,
  },
  {
    id: 7,
    label: `Bloc 7 : CDD/CTT : durée minimale, majoration heures complémentaires et compléments d'heures`,
  },
  { id: 8, label: `Bloc 8 : CDI de chantier ou d'opération` },
  {
    id: 9,
    label: `Bloc 9 : Egalité professionnelle entre les femmes et les hommes`,
  },
  {
    id: 10,
    label: `Bloc 10 : Conditions et les durées de renouvellement de la période d’essai`,
  },
  {
    id: 11,
    label: `Bloc 11 : Modalités de poursuite des contrats de travail`,
  },
  { id: 12, label: `Bloc 12 : Mise à disposition d’un salarié temporaire` },
  { id: 13, label: `Bloc 13 : Rémunération minimale du salarié porté` },
  {
    id: 14,
    label: `Bloc 14 : Prévention des effets de l’exposition aux facteurs de risques professionnels`,
  },
  {
    id: 15,
    label: `Bloc 15 : Insertion professionnelle et maintien dans l’emploi des travailleurs handicapés`,
  },
  {
    id: 16,
    label: `Bloc 16 : Effectif à partir duquel les délégués syndicaux peuvent être désignés, nombre et valorisation de leurs parcours syndical`,
  },
  { id: 17, label: `Bloc 17 : Primes pour travaux dangereux ou insalubres` },
];

function CcnBlocks({ id, blocks, onChange }) {
  const nbBlocks = 17;
  const initialSelections = useMemo(
    () =>
      Array.from(
        { length: nbBlocks },
        (k, v) => (blocks && blocks[v + 1] && blocks[v + 1]) || []
      ),
    [blocks]
  );
  useEffect(() => {
    // reset selection state when input blocks change
    setSelections(initialSelections);
    setDirty(false);
  }, [id, initialSelections]);
  const [selections, setSelections] = useState(initialSelections);
  const [dirty, setDirty] = useState(false);
  const onTextAreaChange = (e, index) => {
    const newSelection = e.target.value.split("\n");
    const newSelections = [...selections];
    newSelections[index] = newSelection;
    setSelections(newSelections);
    setDirty(true);
  };
  const onSaveClick = async () => {
    const selectionsDict = selections.reduce(
      (a, c, i) => ({
        ...a,
        [i + 1]: c,
      }),
      {}
    );
    await onChange(selectionsDict);
    setDirty(false);
  };
  return (
    <div>
      <Button
        disabled={!dirty}
        onClick={onSaveClick}
        style={{ margin: "20px" }}
        type="submit"
      >
        <>
          <IoMdSave
            style={{
              flex: "0 0 auto",
              height: th.sizes.iconSmall,
              mr: th.space.xxsmall,
              width: th.sizes.iconSmall,
            }}
          />
          Enregistrer
        </>
      </Button>
      {selections.map((selection, i) => {
        const boxHeight = Math.max(100, 50 + selection.length * 30);
        return (
          <div key={i} style={{ marginBottom: "50px" }}>
            <h3>{blocksDefinition.find((b) => b.id === i + 1).label}</h3>
            <textarea
              className="fr-input"
              style={{ height: boxHeight }}
              value={
                (selection && selection.join && selection.join("\n")) || ""
              }
              onChange={(e) => onTextAreaChange(e, i)}
            />
          </div>
        );
      })}
    </div>
  );
}

CcnBlocks.propTypes = {
  blocks: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export function KaliBlocksPage() {
  const [ccnId, setCcnId] = useState("573");
  const [result] = useQuery({
    query: searchKaliDocumentQuery,
  });
  const { fetching, error, data } = result;

  // eslint-disable-next-line no-unused-vars
  const [updateBlocksResult, updateBlocks] = useMutation(
    editKaliBlocksMutation
  );

  if (fetching) {
    return <Layout title="Blocs KALI">chargement...</Layout>;
  }
  if (error) {
    return (
      <Layout title="Blocs KALI">
        <Alert severity="error">{error.message}</Alert>
      </Layout>
    );
  }
  const onCcnSelectChange = (e) => {
    if (e.target.value) {
      setCcnId(e.target.value);
    } else {
      setCcnId(null);
    }
  };
  const onBlocksChange = (blocks) => {
    return updateBlocks({
      blocks,
      id: ccnId,
    });
  };
  const ccn = ccnId && data.kali_blocks.find((kali) => kali.id === ccnId);
  return (
    <Layout title="Blocs KALI">
      <Stack>
        <Card style={{ padding: "20px" }}>
          <InputLabel id="select-label">Convention collective</InputLabel>
          <Select
            labelId="select-label"
            style={{ width: "800px", color: "black" }}
            onChange={onCcnSelectChange}
            label="Convention collective"
          >
            {data.kali_blocks.map((ccn) => (
              <MenuItem
                key={ccn.id}
                value={ccn.id}
                style={{
                  maxWidth: "70vw",
                  display: "flex",
                  flexWrap: "wrap",
                  whiteSpace: "normal",
                }}
              >
                {ccn.idcc} - {ccn.title}
              </MenuItem>
            ))}
          </Select>
        </Card>

        <Card style={{ padding: "20px" }}>
          {(ccn && (
            <CcnBlocks
              id={ccn.id}
              blocks={ccn.blocks}
              onChange={onBlocksChange}
            />
          )) || (
            <Alert severity="success">
              Choisissez une convention collective pour définir les blocks
            </Alert>
          )}
        </Card>
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(KaliBlocksPage));
