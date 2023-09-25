import { ModelCreation } from "src/components/models";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function ModelCreationPage() {
  return (
    <Layout title="Modèles de document">
      <ModelCreation />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ModelCreationPage));
