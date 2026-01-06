import { Layout } from "src/components/layout/auth.layout";
import { WhatIsNewDashboard } from "src/modules/what-is-new";

export function WhatIsNewPage() {
  return (
    <Layout title="Quoi de neuf ?">
      <WhatIsNewDashboard />
    </Layout>
  );
}

export default WhatIsNewPage;
