import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { useUser } from "src/hooks/useUser";
import { Field, NavLink } from "theme-ui";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { Inline } from "../layout/Inline";
import { Stack } from "../layout/Stack";

export function PasswordForm({
  onSubmit,
  action = "/api/change_password",
  backHref = "/account",
  changeOldPassword = false,
}) {
  let loading;
  const { user } = useUser();
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
    minLength: {
      message: "Le mot de passe doit faire au moins 12 caractères",
      value: 12,
    },
    pattern: {
      message:
        "Le mot de passe doit être composer d'au moins 1 minuscule, 1 majuscule, 1 nombre et 1 charactère spécial",
      value: /(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[$@$!#.])[A-Za-zd$@$!%*?&.]/i,
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
        {
          message: "L'ancien mot de passe ne correspond pas.",
          type: "validate",
        },
        { shouldFocus: true }
      );
    }
    loading = false;
  }

  return (
    <form onSubmit={handleSubmit(localSubmit)} action={action}>
      <Stack gap={["small", "large"]}>
        {changeOldPassword && (
          <div>
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

        <div>
          <Field
            label="Nouveau mot de passe"
            type="password"
            {...register("password", passwordFieldRegistration)}
          />
          <FormErrorMessage errors={errors} fieldName="password" />
        </div>

        <div>
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
        <Inline>
          <Button disabled={hasError || loading}>{buttonLabel}</Button>
          <Link href={backHref} passHref>
            <NavLink>Annuler</NavLink>
          </Link>
        </Inline>
      </Stack>
      <input type="hidden" {...register("id")} value={user?.id} />
    </form>
  );
}

PasswordForm.propTypes = {
  action: PropTypes.string,
  backHref: PropTypes.string,
  changeOldPassword: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};
