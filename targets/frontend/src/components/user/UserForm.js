import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import {
  MenuItem,
  Select,
  Stack as StackMUI,
  TextField as Field,
} from "@mui/material";
import { useQuery } from "urql";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { Stack } from "../layout/Stack";
import { getRoleQuery } from "../Roles";

export function UserForm({
  onSubmit,
  loading = false,
  user,
  isAdmin = false,
  backHref = "/users",
}) {
  const [results] = useQuery({ query: getRoleQuery });
  const { data, fetching, error } = results;
  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm();
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer le compte";
  if (user) {
    buttonLabel = "Modifier les informations";
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={["small", "large"]}>
        <div style={{ marginBottom: "20px" }}>
          <Field
            type="text"
            placeholder="Lionel Bé"
            {...register("name", {
              required: { message: "Ce champ est requis", value: true },
            })}
            label="Nom d’utilisateur"
            value={user?.name}
          />
          <FormErrorMessage errors={errors} fieldName="name" />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <Field
            type="text"
            label="Email"
            placeholder="lionel.be@beta.gouv.fr"
            {...register("email", {
              pattern: { message: "L'email est invalide", value: /^\S+@\S+$/i },
              required: { message: "Ce champ est requis", value: true },
            })}
            value={user?.email}
          />
          <FormErrorMessage errors={errors} fieldName="email" />
        </div>
        {isAdmin && (
          <div style={{ marginBottom: "20px" }}>
            <p class="fr-text--heavy">Role</p>
            <Select {...register("default_role")} value={user?.roles[0].role}>
              {!fetching &&
                !error &&
                data.roles.map((item) => (
                  <MenuItem key={item.role} value={item.role}>
                    {item.role}
                  </MenuItem>
                ))}
            </Select>
          </div>
        )}
        <div style={{ marginTop: "20px", marginLeft: "20px" }}>
          <StackMUI direction="row" spacing={2} mt={4} justifyContent="end">
            <Link
              href={backHref}
              passHref
              style={{ textDecoration: "none", marginLeft: "10px" }}
            >
              Annuler
            </Link>
            <Button
              variant="contained"
              disabled={hasError || loading}
              type="submit"
            >
              {buttonLabel}
            </Button>
          </StackMUI>
        </div>
      </Stack>
    </form>
  );
}

UserForm.propTypes = {
  backHref: PropTypes.string,
  isAdmin: PropTypes.bool,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  user: PropTypes.object,
};
