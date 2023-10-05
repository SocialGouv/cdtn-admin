import { InformationsCreate } from "src/modules/informations";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditAnswerPage() {
  return (
    <Layout title="Pages d'information">
      <InformationsCreate />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditAnswerPage));
