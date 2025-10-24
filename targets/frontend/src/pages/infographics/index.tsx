import { Layout } from "src/components/layout/auth.layout";
import { InfographicList } from "../../modules/infographics";

export function InfographicsPage() {
  return (
    <Layout title="Infographies">
      <InfographicList />
    </Layout>
  );
}

export default InfographicsPage;
