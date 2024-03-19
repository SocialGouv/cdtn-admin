import { useRouter } from "next/router";
import { InformationsEdit } from "src/modules/informations";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { ReferencesTabs } from "src/components/references";
import { ContributionAnswerReferences } from "src/modules/references/ContributionAnswerReferences";

export function EditAnswerPage() {
  const router = useRouter();
  const id = router?.query?.id as string;

  return (
    <Layout title="Pages d'information">
      <ReferencesTabs
        firstTabTitle="Informations"
        secondTabTitle="Références"
        firstChildren={<InformationsEdit id={id} />}
        secondChildren={<ContributionAnswerReferences id={id} />}
      />
    </Layout>
  );
}

export default withCustomUrqlClient(EditAnswerPage);
