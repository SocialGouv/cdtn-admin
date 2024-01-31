import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { AgreementCreation } from "../../modules/agreements";

export function AgreementCreationPage() {
  return (
    <Layout title="Modèles de document">
      <AgreementCreation />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(AgreementCreationPage));
