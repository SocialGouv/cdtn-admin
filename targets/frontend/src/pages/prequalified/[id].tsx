import { PrequalifiedEdition } from "src/modules/prequalified";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useRouter } from "next/router";

export function PrequalifiedPage() {
  const router = useRouter();
  const id = router?.query?.id as string;
  return (
    <Layout title="Requêtes préqualifiées">
      <PrequalifiedEdition id={id} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(PrequalifiedPage));
