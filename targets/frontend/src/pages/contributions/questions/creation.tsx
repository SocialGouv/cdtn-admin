import { NewQuestion } from "../../../components/contributions/questions/creation";
import { Layout } from "src/components/layout/auth.layout";

export function ContributionsPage() {
  return (
    <Layout title="Contributions">
      <NewQuestion />
    </Layout>
  );
}

export default ContributionsPage;
