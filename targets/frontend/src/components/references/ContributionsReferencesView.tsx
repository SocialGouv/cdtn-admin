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
        {props.references
          .sort((a, b) => parseInt(a.agreementId) - parseInt(b.agreementId))
          .map((reference) => (
            <ListItem key={reference.answerId} disablePadding>
              <ListItemButton
                onClick={() =>
                  window.open(
                    `/contributions/answers/${reference.answerId}`,
                    "_ blank"
                  )
                }
              >
                <ListItemText
                  primary={`[${reference.agreementId}] Q${reference.questionIndex} - ${reference.questionName}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </CardContent>
    </Card>
  );
}
