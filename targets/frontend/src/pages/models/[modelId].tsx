import { ModelEdition } from "src/modules/models";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useRouter } from "next/router";
import { ReferencesTabs } from "src/components/references";
import { ContributionAnswerReferences } from "src/modules/references/ContributionAnswerReferences";

export function ModelEditionPage() {
  const router = useRouter();
  const modelId = router?.query?.modelId as string;

  return (
    <Layout title="Modèles de document">
      <ReferencesTabs
        firstTabTitle="Modèle"
        secondTabTitle="Références"
        firstChildren={<ModelEdition id={modelId} />}
        secondChildren={<ContributionAnswerReferences id={modelId} />}
      />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ModelEditionPage));
