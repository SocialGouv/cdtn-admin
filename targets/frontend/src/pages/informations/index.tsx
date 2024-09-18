import { InformationList } from "src/modules/informations";

import { Layout } from "src/components/layout/auth.layout";

export function InformationsPage() {
  return (
    <Layout title="Pages Information">
      <InformationList />
    </Layout>
  );
}

export default InformationsPage;
