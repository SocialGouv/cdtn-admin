import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { PasswordLayout } from "src/components/layout/password.layout";
import { PasswordForm } from "src/components/user/PasswordForm";
import { request } from "src/lib/request";
import { Text } from "theme-ui";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { activate, token } = router.query;
  let title = "Nouveau mot de passe";
  let url = "/api/renew_password";
  if (activate) {
    title = "Activer votre compte";
    url = "/api/activate_account";
  }
  const [success, setSuccess] = useState(false);
  let loading = false;

  async function updatePassword({ password }) {
    loading = true;
    try {
      await request(url, { body: { password, token } });
      setSuccess(true);
    } catch (error) {
      console.error(error);
    }
    loading = false;
  }

  if (success) {
    return (
      <PasswordLayout title={title}>
        {activate ? (
          <Text sx={{ fontWeight: 300 }}>
            Votre compte a été activé. Suivez le lien fourni pour vous
            connecter.
          </Text>
        ) : (
          <Text sx={{ fontWeight: 300 }}>
            Votre mot de passe a été ré-initialisé, suivez le lien fourni pour
            vous connecter.
          </Text>
        )}
        <Link href="/login" passHref style={{ textDecoration: "none" }}>
          Se connecter
        </Link>
      </PasswordLayout>
    );
  }
  return (
    <PasswordLayout title={title}>
      <PasswordForm onSubmit={updatePassword} loading={loading} action={url} />
    </PasswordLayout>
  );
}
