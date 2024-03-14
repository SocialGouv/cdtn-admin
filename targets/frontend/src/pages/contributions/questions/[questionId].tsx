import { useRouter } from "next/router";
import { EditQuestion } from "src/components/contributions";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditAnswerPage() {
  const router = useRouter();
  const questionId = router?.query?.questionId as string;

  return (
    <Layout title="Questions">
      <EditQuestion questionId={questionId} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditAnswerPage));
