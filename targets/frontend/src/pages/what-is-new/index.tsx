import { Layout } from "src/components/layout/auth.layout";
import { WhatIsNewMonthList } from "src/modules/what-is-new";

export function WhatIsNewPage() {
  return (
    <Layout title="Quoi de neuf ?">
      <WhatIsNewMonthList />
    </Layout>
  );
}

export default WhatIsNewPage;
