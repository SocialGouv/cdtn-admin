/** @jsx jsx  */
import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { useUser } from "src/hooks/useUser";
import { Field, jsx, NavLink } from "theme-ui";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { Inline } from "../layout/Inline";
import { Stack } from "../layout/Stack";

export function PasswordForm({
  onSubmit,
  action = "/api/change_password",
  lostPassword = false,
  backHref = "/account",
}) {
  let loading;
  const { user } = useUser();
  const { register, handleSubmit, errors, setError, watch } = useForm();
  const hasError = Object.keys(errors).length > 0;
  const buttonLabel = lostPassword ? "Changer le mot de passe" : "Activer";
  const passwordFieldRegistration = {
    minLength: {
      message: "Le mot de passe doit faire au moins 8 caractères",
      value: 8,
    },
    required: { message: "Ce champ est requis", value: true },
  };
  async function localSubmit(data) {
    loading = true;
    try {
      await onSubmit(data);
    } catch (err) {
      console.error("[ PasswordForm ]", err);
      setError(
        "oldPassword",
        "validate",
        "L'ancien mot de passe ne correspond pas."
      );
    }
    loading = false;
  }

  return (
    <form onSubmit={handleSubmit(localSubmit)} action={action}>
      <Stack gap={["small", "large"]}>
        {!lostPassword && (
          <div>
            <Field
              type="password"
              name="oldPassword"
              label="Ancien mot de passe"
              ref={register({
                required: { message: "Ce champ est requis", value: true },
              })}
            />
            <FormErrorMessage errors={errors} fieldName="oldPassword" />
          </div>
        )}

        <div>
          <Field
            label="Nouveau mot de passe"
            type="password"
            name="password"
            ref={register(passwordFieldRegistration)}
          />
          <FormErrorMessage errors={errors} fieldName="password" />
        </div>

        <div>
          <Field
            label="Confirmation du nouveau mot de passe"
            type="password"
            name="confirmNewPassword"
            ref={register({
              ...passwordFieldRegistration,
              validate: (value) =>
                value === watch("password") ||
                "Les mots de passe ne correspondent pas.",
            })}
          />
          <FormErrorMessage errors={errors} fieldName="confirmNewPassword" />
        </div>
        <Inline>
          <Button disabled={hasError || loading}>{buttonLabel}</Button>
          <Link href={backHref} passHref>
            <NavLink>Annuler</NavLink>
          </Link>
        </Inline>
      </Stack>
      <input type="hidden" name="id" value={user?.id} ref={register} />
    </form>
  );
}

PasswordForm.propTypes = {
  action: PropTypes.string,
  backHref: PropTypes.string,
  lostPassword: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};
