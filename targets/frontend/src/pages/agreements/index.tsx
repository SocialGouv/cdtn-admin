import { AgreementList } from "src/modules/agreements";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function AgreementsPage() {
  return (
    <Layout title="Conventions collectives">
      <AgreementList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(AgreementsPage));
