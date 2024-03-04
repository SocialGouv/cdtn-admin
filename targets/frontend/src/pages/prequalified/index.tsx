import { PrequalifiedForm } from "src/components/prequalified";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function ContributionsPage() {
  return (
    <Layout title="Contributions">
      <PrequalifiedForm />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ContributionsPage));
