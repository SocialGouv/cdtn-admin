import { ModelList } from "src/modules/models";

import { Layout } from "src/components/layout/auth.layout";

export function ModelsPage() {
  return (
    <Layout title="Modèles de document">
      <ModelList />
    </Layout>
  );
}

export default ModelsPage;
