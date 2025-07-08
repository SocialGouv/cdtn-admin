import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "src/components/button";
import { useSession } from "next-auth/react";
import { Stack as StackMUI, TextField as Field } from "@mui/material";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { Stack } from "../layout/Stack";
import { passwordValidation } from "../../modules/authentification/utils/regex";

export function PasswordForm({
  onSubmit,
  backHref = "/users/account",
  changeOldPassword = false,
  initialLoading = false,
}) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const { data } = useSession();
  const user = data?.user;
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm();
  const watchedPassword = watch("password", "");
  const hasError = Object.keys(errors).length > 0;
  const buttonLabel = changeOldPassword ? "Changer le mot de passe" : "Activer";
  const passwordFieldRegistration = {
    maxLength: {
      message: "Le mot de passe ne doit pas faire plus de 32 caractères",
      value: 32,
    },
    minLength: {
      message: "Le mot de passe doit faire au moins 12 caractères",
      value: 12,
    },
    pattern: {
      message:
        "Le mot de passe doit être composer d'au moins 1 minuscule, 1 majuscule, 1 nombre et 1 caractère spécial",
      value: passwordValidation,
    },
    required: { message: "Ce champ est requis", value: true },
  };

  async function localSubmit(submitData) {
    setIsLoading(true);
    try {
      await onSubmit(submitData);
    } catch (err) {
      console.error("[ PasswordForm ]", err);
      setError(
        "oldPassword",
        {
          message: "L'ancien mot de passe ne correspond pas.",
          type: "validate",
        },
        { shouldFocus: true }
      );
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit(localSubmit)}>
      <div style={{ marginBottom: "20px" }}>
        Le mot de passe doit faire au moins 12 caractères et doit être composer
        d&apos;au moins 1 minuscule, 1 majuscule, 1 nombre et 1 caractère
        spécial
      </div>
      <Stack gap={["small", "large"]}>
        {changeOldPassword && (
          <div style={{ marginBottom: "20px" }}>
            <Field
              type="password"
              {...register("oldPassword", {
                required: { message: "Ce champ est requis", value: true },
              })}
              defaultValue=""
              label="Ancien mot de passe"
            />
            <FormErrorMessage errors={errors} fieldName="oldPassword" />
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <Field
            label="Nouveau mot de passe"
            type="password"
            {...register("password", passwordFieldRegistration)}
          />
          <FormErrorMessage errors={errors} fieldName="password" />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <Field
            label="Confirmation du nouveau mot de passe"
            type="password"
            {...register("confirmNewPassword", {
              ...passwordFieldRegistration,
              validate: (value) =>
                value === watchedPassword ||
                "Les mots de passe ne correspondent pas.",
            })}
          />
          <FormErrorMessage errors={errors} fieldName="confirmNewPassword" />
        </div>
        <StackMUI direction="row" spacing={2} mt={4} justifyContent="end">
          <Button
            variant="contained"
            disabled={hasError || isLoading}
            type="submit"
          >
            {buttonLabel}
          </Button>
          <Link href={backHref} passHref style={{ textDecoration: "none" }}>
            Annuler
          </Link>
        </StackMUI>
      </Stack>
      <input type="hidden" {...register("id")} value={user?.id} />
    </form>
  );
}

PasswordForm.propTypes = {
  backHref: PropTypes.string,
  changeOldPassword: PropTypes.bool,
  initialLoading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};
