/** @jsx jsx */

import { jsx, Field, Text, NavLink } from "theme-ui";
import { PasswordLayout } from "src/components/layout/password.layout";

import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { request } from "src/lib/request";
import { Stack } from "src/components/layout/Stack";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, errors, setError } = useForm();
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
      setError("email", "validate", "désolé, une erreur est survenue :(");
    }
    loading = false;
  }

  if (success) {
    return (
      <PasswordLayout title="Nouveau mot de passe">
        <Text sx={{ fontWeight: 300 }}>
          Nous venons de vous envoyer un lien pour ré-initialisez votre mot de
          passe par mail. Vous pouvez consulter votre boîte au mail et suivre
          les instructions pour definir un nouveau mot de passe.
          <br />
        </Text>
        <Link href="/login" passHref>
          <NavLink>Se connecter</NavLink>
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
          <Text sx={{ fontWeight: 300 }}>
            Vous avez perdu votre mot de passe&nbsp;?
            <br />
            Saissisez votre adresse email et validez pour recevoir par mail un
            lien pour ré-initialiser votre mot de passe.
          </Text>
          <Field
            label="adresse email"
            name="email"
            ref={register({
              required: { value: true, message: "Ce champ est requis" },
              pattern: {
                value: /^\S+@\S+$/i,
                message: "L'email est invalide",
              },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="email" />
          <Button disabled={hasError || loading}>Valider</Button>
        </Stack>
      </form>
    </PasswordLayout>
  );
}
