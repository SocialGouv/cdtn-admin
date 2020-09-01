import PropTypes from "prop-types";
import React, { useState } from "react";
import { Box, Card, Field, Heading, Text } from "theme-ui";

import { Button } from "../button";
import { Stack } from "../layout/Stack";

const LoginForm = ({ authenticate, resetPassword, onSuccess }) => {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event) => {
    if (event) {
      event.preventDefault();
    }
    setError(null);
    setStatus("loading");
    try {
      const result = await authenticate({ email, password });
      onSuccess(result);
    } catch (err) {
      setError("Impossible de vous authentifier");
      setStatus("error");
    }
  };

  const isValidEmail = email && email.indexOf("@") > -1;
  const isValid = status !== "loading" && isValidEmail && Boolean(password);

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
        <form onSubmit={submit}>
          <Stack>
            <Heading as="h1">Authentification</Heading>
            <Field
              sx={{ fontWeight: "body" }}
              label="Adresse email"
              placeholder="ex: lionel@travail.gouv.fr"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              sx={{ fontWeight: "body" }}
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="•••••••••"
              defaultValue={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <Text color="critical">{error}</Text>}
            <Button type="submit" onClick={submit} disabled={!isValid}>
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
