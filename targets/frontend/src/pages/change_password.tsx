import { useRouter } from "next/router";
import { useState } from "react";
import { PasswordLayout } from "src/components/layout/password.layout";
import { PasswordForm } from "src/components/user/PasswordForm";
import { Typography } from "@mui/material";
import { Button } from "src/components/button";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function updatePassword({ password }: { password: string }) {
    setLoading(true);
    try {
      const result = await fetch(`/api/users/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, token }),
      });

      const resultJson = await result.json();

      if (!result.ok) {
        alert(`Un problème est survenu, l'erreur est : ${resultJson.message}`);
        return;
      }
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue...");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <PasswordLayout title={"Nouveau mot de passe"}>
        <Typography style={{ fontWeight: 300 }}>
          Votre mot passe a été mis à jour. Suivez le lien fourni pour vous
          connecter.
        </Typography>
        <Button
          style={{ marginTop: "30px" }}
          onClick={() => {
            router.push("/login");
          }}
        >
          Se connecter
        </Button>
      </PasswordLayout>
    );
  }
  return (
    <PasswordLayout title={"Nouveau mot de passe"}>
      <PasswordForm onSubmit={updatePassword} initialLoading={loading} />
    </PasswordLayout>
  );
}
