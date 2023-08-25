import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { PasswordLayout } from "src/components/layout/password.layout";
import { Stack } from "src/components/layout/Stack";
import { request } from "src/lib/request";
import { TextField as Field } from "@mui/material";

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,

    formState: { errors },
  } = useForm();
  const hasError = Object.keys(errors).length > 0;
  let loading = false;

  async function resetPassword(data) {
    console.log(data);
    loading = true;
    try {
      await request("/api/reset_password", { body: data });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setError(
        "email",
        {
          message: "désolé, une erreur est survenue :(",
          type: "validate",
        },
        { shouldFocus: true }
      );
    }
    loading = false;
  }

  if (success) {
    return (
      <PasswordLayout title="Nouveau mot de passe">
        <p style={{ fontWeight: 300 }}>
          Nous venons de vous envoyer un lien pour ré-initialiser votre mot de
          passe par mail. Vous pouvez consulter votre boîte mail et suivre les
          instructions pour définir un nouveau mot de passe.
          <br />
        </p>
        <Link href="/login" passHref style={{ textDecoration: "none" }}>
          Se connecter
        </Link>
      </PasswordLayout>
    );
  }
  return (
    <PasswordLayout title="Nouveau mot de passe">
      <form
        onSubmit={handleSubmit(resetPassword)}
        method="post"
        action="/api/reset_password"
      >
        <Stack>
          <p style={{ fontWeight: 300 }}>
            Vous avez perdu votre mot de passe&nbsp;?
            <br />
            Saisissez votre adresse email et validez pour recevoir par mail un
            lien pour ré-initialiser votre mot de passe.
          </p>
          <Field
            label="adresse email"
            {...register("email", {
              pattern: {
                message: "L'email est invalide",
                value: /^\S+@\S+$/i,
              },
              required: { message: "Ce champ est requis", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="email" />
          <Button disabled={hasError || loading} style={{ marginTop: "30px" }}>
            Valider
          </Button>
        </Stack>
      </form>
    </PasswordLayout>
  );
}
