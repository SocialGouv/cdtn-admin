import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { PasswordLayout } from "src/components/layout/password.layout";
import { Stack } from "src/components/layout/Stack";
import { TextField as Field } from "@mui/material";
import { useRouter } from "next/router";

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,

    formState: { errors },
  } = useForm();
  const hasError = Object.keys(errors).length > 0;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function resetPassword({ email }: any) {
    setLoading(true);
    try {
      const result = await fetch(`/api/users/password/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const resultJson = await result.json();

      if (!result.ok) {
        setError(
          "email",
          {
            message: `Un problème est survenu, l'erreur est : ${resultJson.message}`,
            type: "validate",
          },
          { shouldFocus: true }
        );
        return;
      }
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setError(
        "email",
        {
          message: "Désolé, une erreur est survenue :(",
          type: "validate",
        },
        { shouldFocus: true }
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <PasswordLayout title="Nouveau mot de passe">
        <p>
          Nous venons de vous envoyer un lien pour ré-initialiser votre mot de
          passe par mail.
          <br />
          <br />
          Vous pouvez consulter votre boîte mail et suivre les instructions pour
          définir un nouveau mot de passe.
        </p>
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
    <PasswordLayout title="Nouveau mot de passe">
      <form onSubmit={handleSubmit(resetPassword)}>
        <Stack>
          <p style={{ fontWeight: 300 }}>
            Vous avez perdu votre mot de passe&nbsp;?
            <br />
            Saisissez votre adresse email et validez pour recevoir par mail un
            lien pour ré-initialiser votre mot de passe.
          </p>
          <Field
            label="email"
            type="email"
            {...register("email", {
              pattern: {
                message: "L'email est invalide",
                value: /^\S+@\S+$/i,
              },
              required: { message: "Ce champ est requis", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="email" />
          <Button
            disabled={hasError || loading}
            style={{ marginTop: "30px" }}
            type="submit"
          >
            Valider
          </Button>
        </Stack>
      </form>
    </PasswordLayout>
  );
}
