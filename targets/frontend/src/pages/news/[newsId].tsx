import { Layout } from "src/components/layout/auth.layout";
import { useRouter } from "next/router";
import { NewsEdition } from "../../modules/news";

export function NewsEditionPage() {
  const router = useRouter();
  const newsId = router?.query?.newsId as string;

  return (
    <Layout title="Actualités">
      <NewsEdition id={newsId} />
    </Layout>
  );
}

export default NewsEditionPage;
