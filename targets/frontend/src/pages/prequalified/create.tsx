import { PrequalifiedCreate } from "src/modules/prequalified";
import { Layout } from "src/components/layout/auth.layout";

export function PrequalifiedNewPage() {
  return (
    <Layout title="Requêtes préqualifiées">
      <PrequalifiedCreate />
    </Layout>
  );
}

export default PrequalifiedNewPage;
