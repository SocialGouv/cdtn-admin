import { InformationsCreate } from "src/modules/informations";
import { Layout } from "src/components/layout/auth.layout";

export function EditAnswerPage() {
  return (
    <Layout title="Pages d'information">
      <InformationsCreate />
    </Layout>
  );
}

export default EditAnswerPage;
