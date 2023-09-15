import { ModelList } from "src/components/models";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function InformationsPage() {
  return (
    <Layout title="Modèles de document">
      <ModelList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(InformationsPage));
