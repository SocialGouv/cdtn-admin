/** @jsx jsx  */

import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { PasswordForm } from "src/components/user/PasswordForm";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withAuthProvider } from "src/lib/auth";
import { request } from "src/lib/request";
import { jsx } from "theme-ui";

export function ChangeMyPasswordPage() {
  const router = useRouter();
  async function handleChangePasword({ id, oldPassword, password }) {
    await request("/api/change_password", {
      body: { id, oldPassword, password },
    });

    router.push("/user/account");
  }

  return (
    <Layout title="Modifier mon mot de passe">
      <PasswordForm onSubmit={handleChangePasword} />
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(ChangeMyPasswordPage));
