import { useRouter } from "next/router";
import { ContributionsAnswer } from "src/components/contributions";
import { ContributionAnswerReferences } from "src/modules/references/ContributionAnswerReferences";
import { Layout } from "src/components/layout/auth.layout";
import { ReferencesTabs } from "src/components/references";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditInformationPage() {
  const router = useRouter();
  const answerId = router?.query?.answerId as string;

  return (
    <Layout title="Contributions - Réponse">
      <ReferencesTabs
        firstTabTitle="Contribution"
        secondTabTitle="Références"
        firstChildren={<ContributionsAnswer id={answerId} />}
        secondChildren={<ContributionAnswerReferences id={answerId} />}
      />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
