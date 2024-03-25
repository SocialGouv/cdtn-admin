import { Layout } from "src/components/layout/auth.layout";

import { QuestionList } from "../../components/contributions";

export function ContributionsPage() {
  return (
    <Layout title="Contributions">
      <QuestionList />
    </Layout>
  );
}

export default ContributionsPage;
