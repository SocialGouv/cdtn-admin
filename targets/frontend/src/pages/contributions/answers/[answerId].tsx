/** @jsxImportSource theme-ui */

import { useRouter } from "next/router";
import { ContributionsAnswer } from "src/components/contributions";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditInformationPage() {
  const router = useRouter();
  const answerId = router?.query?.answerId as string;

  return (
    <Layout title="Réponse">
      <ContributionsAnswer id={answerId} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
