import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  TextField as Field,
  Typography,
  Alert,
} from "@mui/material";

import { Button } from "../button";
import { Stack } from "../layout/Stack";
import { theme } from "../../theme";

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
    <Box style={{ maxWidth: "500px" }}>
      <Card variant="compact">
        <form onSubmit={handleSubmit(submit)}>
          <Stack>
            <Typography variant="h3" style={{ marginBottom: "40px" }}>
              Authentification
            </Typography>
            <Field
              sx={{ fontWeight: theme.fontWeights.body }}
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
              <Alert severity="error">{errors.email?.message}</Alert>
            )}
            <Field
              sx={{ fontWeight: theme.fontWeights.body, marginTop: "20px" }}
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
              <Alert severity="error">{errors.password?.message}</Alert>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ marginTop: "50px", marginBottom: "10px" }}
            >
              Se connecter
            </Button>
            <Button
              variant="text"
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
