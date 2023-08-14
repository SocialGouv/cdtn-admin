import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Box, Card, Input as Field, Typography, Text } from "@mui/material";

import { Button } from "../button";
import { Stack } from "../layout/Stack";

const LoginForm = ({ authenticate, resetPassword, onSuccess }) => {
  const {
    handleSubmit,
    register,
    setError,

    formState: { isSubmitting, errors },
  } = useForm();

  const submit = async ({ email, password }) => {
    try {
      const result = await authenticate({ email, password });
      onSuccess(result);
    } catch (err) {
      setError(
        "password",
        {
          message: "Utilisateur ou mot passe incorrect",
          type: "manual",
        },
        { shouldFocus: true }
      );
    }
  };
  return (
    <Box
      sx={{
        maxWidth: [null, "500px", "500px"],
      }}
    >
      <Card
        variant="compact"
        sx={{ px: ["xsmall", "medium"], py: ["small", "large"] }}
      >
        <form onSubmit={handleSubmit(submit)}>
          <Stack>
            <Typography variant="h1">Authentification</Typography>
            <Field
              sx={{ fontWeight: "body" }}
              label="Adresse email"
              placeholder="ex: lionel@travail.gouv.fr"
              {...register("email", {
                required: {
                  message: "ce champ est requis",
                  value: true,
                },
              })}
              type="email"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <Text role="alert" color="critical">
                {errors.email?.message}
              </Text>
            )}
            <Field
              sx={{ fontWeight: "body" }}
              label="Mot de passe"
              {...register("password", {
                required: {
                  message: "ce champ est requis",
                  value: true,
                },
              })}
              type="password"
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <Text role="alert" color="critical">
                {errors.password?.message}
              </Text>
            )}
            <Button type="submit" disabled={isSubmitting}>
              Se connecter
            </Button>
            <Button
              variant="link"
              size="small"
              title="Saisissez votre email pour récupérer votre mot de passe"
              onClick={resetPassword}
              type="button"
            >
              Mot de passe perdu
            </Button>
          </Stack>
        </form>
      </Card>
    </Box>
  );
};

export default LoginForm;

LoginForm.propTypes = {
  authenticate: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  resetPassword: PropTypes.func.isRequired,
};
