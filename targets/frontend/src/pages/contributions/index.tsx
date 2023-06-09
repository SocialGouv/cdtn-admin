import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

import { ContributionsList } from "../../components/contributions";

export function ContributionsPage() {
  return (
    <Layout title="Contributions">
      <ContributionsList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ContributionsPage));
