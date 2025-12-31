import { Layout } from "src/components/layout/auth.layout";
import { WhatIsNewCreation } from "src/modules/what-is-new/components/Creation";

export function WhatIsNewCreationPage() {
  return (
    <Layout title="Quoi de neuf ?">
      <WhatIsNewCreation />
    </Layout>
  );
}

export default WhatIsNewCreationPage;