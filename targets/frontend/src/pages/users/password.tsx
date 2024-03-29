import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { PasswordForm } from "src/components/user/PasswordForm";

export function ChangeMyPasswordPage() {
  const router = useRouter();

  const handleChangePasword = async ({ oldPassword, password }: any) => {
    const result = await fetch(`/api/users/password/change`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword: password }),
    });

    const resultJson = await result.json();

    if (!result.ok) {
      alert(
        `Une erreur est survenue lors du changement du mot de passe <=> ${resultJson.message}`
      );
      return;
    }

    router.push("/users/account");
  };

  return (
    <Layout title="Modifier mon mot de passe">
      <PasswordForm changeOldPassword onSubmit={handleChangePasword} />
    </Layout>
  );
}

export default ChangeMyPasswordPage;
