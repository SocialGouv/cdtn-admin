import { PrequalifiedList } from "src/modules/prequalified";
import { Layout } from "src/components/layout/auth.layout";

export function PrequalifiedPage() {
  return (
    <Layout title="Liste des requêtes Préqualifiés">
      <PrequalifiedList />
    </Layout>
  );
}

export default PrequalifiedPage;
