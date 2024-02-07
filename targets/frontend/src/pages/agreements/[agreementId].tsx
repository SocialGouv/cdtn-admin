import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useRouter } from "next/router";
import { AgreementEdition } from "../../modules/agreements";

export function AgreementEditionPage() {
  const router = useRouter();
  const agreementId = router?.query?.agreementId as string;

  return (
    <Layout title="Convention collective">
      <AgreementEdition id={agreementId} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(AgreementEditionPage));
