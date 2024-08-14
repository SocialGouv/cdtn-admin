import { useRouter } from "next/router";
import { ViewQuestion } from "src/components/contributions";
import { Layout } from "src/components/layout/auth.layout";

export function EditAnswerPage() {
  const router = useRouter();
  const questionId = router?.query?.questionId as string;

  return (
    <Layout title="Questions">
      <ViewQuestion questionId={questionId} />
    </Layout>
  );
}

export default EditAnswerPage;
