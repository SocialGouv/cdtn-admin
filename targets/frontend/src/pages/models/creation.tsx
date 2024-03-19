import { ModelCreation } from "src/modules/models";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";

export function ModelCreationPage() {
  return (
    <Layout title="Modèles de document">
      <ModelCreation />
    </Layout>
  );
}

export default withCustomUrqlClient(ModelCreationPage);
