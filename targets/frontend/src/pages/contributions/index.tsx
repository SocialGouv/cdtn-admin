import { Layout } from "src/components/layout/auth.layout";

import { ContributionsList } from "../../components/contributions";

export function ContributionsPage() {
  return (
    <Layout title="contributions">
      <ContributionsList />
    </Layout>
  );
}

export default ContributionsPage;
