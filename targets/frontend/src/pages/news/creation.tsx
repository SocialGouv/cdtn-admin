import { Layout } from "src/components/layout/auth.layout";
import { NewsCreation } from "../../modules/news";

export function NewsCreationPage() {
  return (
    <Layout title="Actualités">
      <NewsCreation />
    </Layout>
  );
}

export default NewsCreationPage;
