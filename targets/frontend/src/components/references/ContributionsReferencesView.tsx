import {
  Card,
  CardContent,
  CardHeader,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useRouter } from "next/router";
import { ContributionReferences } from "src/modules/references/useContributionReferencesQuery";

type Props = {
  references: Array<ContributionReferences>;
};

export function ContributionsReferencesView(props: Props) {
  const router = useRouter();
  if (props.references.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <ListItem disablePadding>
            <ListItemText primary="Aucune référence n'a été trouvée." />
          </ListItem>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card variant="outlined">
      <CardHeader
        title="Contributions"
        subheader={`${props.references.length} référence(s) trouvée(s)`}
      />
      <CardContent>
        {props.references.map((reference) => (
          <ListItem key={reference.answer.id} disablePadding>
            <ListItemButton
              onClick={() =>
                router.push(`/contributions/answers/${reference.answer.id}`)
              }
            >
              <ListItemText
                primary={`[${reference.answer.agreement_id}] ${reference.answer.question.content}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </CardContent>
    </Card>
  );
}
