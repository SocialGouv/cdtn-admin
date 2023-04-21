/** @jsxImportSource theme-ui */

import { useRouter } from "next/router";
import { ContributionsAnswer } from "src/components/contributions";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditInformationPage() {
  const router = useRouter();
  const idQuestion = router?.query?.questionId as string;
  const idCc = router?.query?.ccId as string;

  return (
    <Layout>
      <ContributionsAnswer idQuestion={idQuestion} idCc={idCc} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
