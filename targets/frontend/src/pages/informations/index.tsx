import { QuestionList } from "src/components/informations";

import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function InformationsPage() {
  return (
    <Layout title="Contributions">
      <QuestionList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(InformationsPage));
