import { Layout } from "src/components/layout/auth.layout";
import { useRouter } from "next/router";
import { WhatIsNewEdition } from "src/modules/what-is-new/components/Edition";

export function WhatIsNewEditionPage() {
  const router = useRouter();
  const id = router?.query?.id as string;

  return (
    <Layout title="Quoi de neuf ?">
      <WhatIsNewEdition id={id} />
    </Layout>
  );
}

export default WhatIsNewEditionPage;
