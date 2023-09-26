import { useRouter } from "next/router";
import { InformationsEdit } from "src/modules/informations";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

export function EditAnswerPage() {
  const router = useRouter();
  const id = router?.query?.id as string;

  return (
    <Layout title="Pages d'information">
      <InformationsEdit id={id} />
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditAnswerPage));
