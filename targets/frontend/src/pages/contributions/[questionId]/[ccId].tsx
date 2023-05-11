/** @jsxImportSource theme-ui */

import { useRouter } from "next/router";
import { ContributionsAnswer } from "src/components/contributions";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditInformationPage() {
  const router = useRouter();
  const questionId = router?.query?.questionId as string;
  const agreementId = router?.query?.ccId as string;

  return (
    <Layout>
      <ContributionsAnswer questionId={questionId} agreementId={agreementId} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
