import { Layout } from "src/components/layout/auth.layout";
import { useRouter } from "next/router";
import { ReferencesTabs } from "src/components/references";
import { ContributionAnswerReferences } from "src/modules/references/ContributionAnswerReferences";
import { InfographicEdition } from "../../modules/infographics";

export function InfographicEditionPage() {
  const router = useRouter();
  const infographicId = router?.query?.infographicId as string;

  return (
    <Layout title="Infographies">
      <ReferencesTabs
        firstTabTitle="Infographies"
        secondTabTitle="Références"
        firstChildren={<InfographicEdition id={infographicId} />}
        secondChildren={<ContributionAnswerReferences id={infographicId} />}
      />
    </Layout>
  );
}

export default InfographicEditionPage;
