import { ModelList } from "src/components/models";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function ModelsPage() {
  return (
    <Layout title="Modèles de document">
      <ModelList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ModelsPage));
