import { ModelCreation } from "src/modules/models";

import { Layout } from "src/components/layout/auth.layout";

export function ModelCreationPage() {
  return (
    <Layout title="Modèles de document">
      <ModelCreation />
    </Layout>
  );
}

export default ModelCreationPage;
