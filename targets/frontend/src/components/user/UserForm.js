import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { TextField as Field, Label, Select } from "@mui/material";
import { useQuery } from "urql";

import { FormErrorMessage } from "../forms/ErrorMessage";
import { Inline } from "../layout/Inline";
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
        <div>
          <Field
            type="text"
            placeholder="Lionel Bé"
            {...register("name", {
              required: { message: "Ce champ est requis", value: true },
            })}
            label="Nom d’utilisateur"
            defaultValue={user?.name}
          />
          <FormErrorMessage errors={errors} fieldName="name" />
        </div>
        <div>
          <Field
            type="text"
            label="Email"
            placeholder="lionel.be@beta.gouv.fr"
            {...register("email", {
              pattern: { message: "L'email est invalide", value: /^\S+@\S+$/i },
              required: { message: "Ce champ est requis", value: true },
            })}
            defaultValue={user?.email}
          />
          <FormErrorMessage errors={errors} fieldName="email" />
        </div>
        {isAdmin && (
          <div>
            <Label>Role</Label>
            <Select
              {...register("default_role")}
              defaultValue={user?.roles[0].role}
            >
              {!fetching &&
                !error &&
                data.roles.map((item) => (
                  <option key={item.role} value={item.role}>
                    {item.role}
                  </option>
                ))}
            </Select>
          </div>
        )}
        <Inline>
          <Button disabled={hasError || loading}>{buttonLabel}</Button>
          <Link href={backHref} passHref style={{ textDecoration: "none" }}>
            Annuler
          </Link>
        </Inline>
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
