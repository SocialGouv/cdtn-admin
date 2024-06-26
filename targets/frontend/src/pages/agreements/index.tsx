import { AgreementList } from "src/modules/agreements";

import { Layout } from "src/components/layout/auth.layout";

export function AgreementsPage() {
  return (
    <Layout title="Conventions collectives">
      <AgreementList />
    </Layout>
  );
}

export default AgreementsPage;
