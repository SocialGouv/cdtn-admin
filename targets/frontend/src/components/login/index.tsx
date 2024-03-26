import PropTypes from "prop-types";
import { UseFormSetError, useForm } from "react-hook-form";
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

type LoginFormProps = {
  resetPassword: () => void;
  onLogin: (
    email: string,
    password: string,
    setError: UseFormSetError<any>
  ) => void;
};

const LoginForm = ({ resetPassword, onLogin }: LoginFormProps) => {
  const {
    handleSubmit,
    register,
    setError,

    formState: { isSubmitting, errors },
  } = useForm();

  const submit = async ({ email, password }: any) => {
    onLogin(email, password, setError);
  };
  return (
    <Card style={{ maxWidth: "500px", padding: "30px" }}>
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
          {errors.email && errors.email.message && (
            <Alert severity="error">{errors.email.message.toString()}</Alert>
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
          {errors.password && errors.password.message && (
            <Alert severity="error">{errors.password.message.toString()}</Alert>
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
            title="Saisissez votre email pour récupérer votre mot de passe"
            onClick={resetPassword}
            type="button"
          >
            Mot de passe perdu
          </Button>
        </Stack>
      </form>
    </Card>
  );
};

export default LoginForm;
