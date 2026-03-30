import { Layout } from "src/components/layout/auth.layout";
import { NewsList } from "../../modules/news";

export function NewsPage() {
  return (
    <Layout title="Infographies">
      <NewsList />
    </Layout>
  );
}

export default NewsPage;
