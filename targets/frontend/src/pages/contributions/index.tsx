import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

import { QuestionList } from "../../components/contributions";

export function ContributionsPage() {
  return (
    <Layout title="Contributions">
      <QuestionList />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ContributionsPage));
