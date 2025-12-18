import { Layout } from "src/components/layout/auth.layout";
import { InfographicCreation } from "../../modules/infographics";

export function InfographicCreationPage() {
  return (
    <Layout title="Infographies">
      <InfographicCreation />
    </Layout>
  );
}

export default InfographicCreationPage;
