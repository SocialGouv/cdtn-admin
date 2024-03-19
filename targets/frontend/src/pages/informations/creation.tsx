import { InformationsCreate } from "src/modules/informations";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";

export function EditAnswerPage() {
  return (
    <Layout title="Pages d'information">
      <InformationsCreate />
    </Layout>
  );
}

export default withCustomUrqlClient(EditAnswerPage);
