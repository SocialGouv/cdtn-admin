import { useContext } from "react";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { SelectionContext } from "src/pages/contenus/fiches-sp";
import { theme } from "src/theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputLabel as Label,
  Typography,
} from "@mui/material";

export function ServicPublicList({ items }: any) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: "2.5rem" }} />
          <TableCell align="left">id</TableCell>
          <TableCell align="left">status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item: any) => (
          <ServicePublicItemRow key={item.id} item={item} />
        ))}
      </TableBody>
    </Table>
  );
}

function ServicePublicItemRow({ item }: any) {
  const { selectedItems, setSelectedItems } = useContext(SelectionContext);

  function updateSelection(event: any) {
    if (event.target.checked) {
      setSelectedItems(selectedItems.concat(item.id));
    } else {
      setSelectedItems(selectedItems.filter((id) => item.id !== id));
    }
  }
  return (
    <TableRow>
      <TableCell>
        <div className="fr-checkbox-group">
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={updateSelection}
            id={`row-${item.id}`}
            aria-describedby="checkbox-messages"
          />
          <label className="fr-label" htmlFor={`row-${item.id}`} />
          <div
            className="fr-messages-group"
            id="checkbox-messages"
            aria-live="polite"
          />
        </div>
      </TableCell>
      <TableCell>
        <Label htmlFor={`row-${item.id}`} sx={{ cursor: "pointer" }}>
          {item.id}
        </Label>
      </TableCell>
      <TableCell>{getStatus(item)}</TableCell>
    </TableRow>
  );
}

function getStatus({ status, cdtn_id, is_available, is_published }: any) {
  if (status === "unknow") {
    return (
      <Typography style={{ color: theme.colors.critical }}>
        fiche inconnue
      </Typography>
    );
  }
  if (cdtn_id === null) {
    if (status === "unknown") {
      return (
        <Typography style={{ color: theme.colors.critical }}>
          la fiche n’existe pas
        </Typography>
      );
    }
    return (
      <Typography style={{ color: theme.colors.muted }}>
        En attente de traitement
      </Typography>
    );
  }
  if (is_available) {
    if (is_published) {
      return (
        <Typography style={{ color: theme.colors.positive }}>
          <IoMdCheckmarkCircleOutline
            aria-label="la fiche est disponible"
            title="La fiche est disponible"
          />
        </Typography>
      );
    }
    return (
      <Typography style={{ color: theme.colors.muted }}>dépubliée</Typography>
    );
  }
  return (
    <Typography style={{ color: theme.colors.critical }}>supprimée </Typography>
  );
}
