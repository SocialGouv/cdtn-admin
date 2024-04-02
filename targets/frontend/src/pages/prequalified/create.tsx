import { PrequalifiedCreate } from "src/modules/prequalified";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function PrequalifiedNewPage() {
  return (
    <Layout title="Requêtes préqualifiées">
      <PrequalifiedCreate />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(PrequalifiedNewPage));
