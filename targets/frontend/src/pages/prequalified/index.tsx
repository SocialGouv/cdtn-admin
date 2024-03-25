import { PrequalifiedList } from "src/modules/prequalified";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function PrequalifiedPage() {
  return (
    <Layout title="Liste des requêtes Préqualifiés">
      <PrequalifiedList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(PrequalifiedPage));
