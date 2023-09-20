import { useRouter } from "next/router";
import { InformationsCreate } from "src/components/informations";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditAnswerPage() {
  const router = useRouter();

  return (
    <Layout title="Pages d'information">
      <InformationsCreate />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditAnswerPage));
