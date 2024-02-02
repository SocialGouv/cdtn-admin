import { ContributionsReferencesView } from "src/components/references";
import { useContributionReferencesQuery } from "./useContributionReferencesQuery";

type Props = {
  id: string;
};

export const ContributionAnswerReferences = ({ id }: Props) => {
  const references = useContributionReferencesQuery({ id });
  return <ContributionsReferencesView references={references} />;
};
