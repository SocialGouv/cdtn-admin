/** @jsx jsx  */
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { Field, jsx, Label, Select, NavLink } from "theme-ui";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { Stack } from "../layout/Stack";
import { useQuery } from "urql";
import { getRoleQuery } from "../Roles";
import Link from "next/link";
import { Inline } from "../layout/Inline";

export function UserForm({
  onSubmit,
  loading = false,
  user,
  isAdmin = false,
  backHref = "/users",
}) {
  const [results] = useQuery({ query: getRoleQuery });
  const { data, fetching, error } = results;
  const { register, handleSubmit, errors } = useForm();
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
            name="name"
            label="Nom d’utilisateur"
            defaultValue={user?.name}
            ref={register({
              required: { value: true, message: "Ce champ est requis" },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="name" />
        </div>
        <div>
          <Field
            type="text"
            label="Email"
            placeholder="lionel.be@beta.gouv.fr"
            name="email"
            defaultValue={user?.email}
            ref={register({
              required: { value: true, message: "Ce champ est requis" },
              pattern: { value: /^\S+@\S+$/i, message: "L'email est invalide" },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="email" />
        </div>
        {isAdmin && (
          <div>
            <Label>Role</Label>
            <Select
              name="default_role"
              defaultValue={user?.roles[0].role}
              ref={register()}
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
          <Link href={backHref} passHref>
            <NavLink>Annuler</NavLink>
          </Link>
        </Inline>
      </Stack>
    </form>
  );
}

UserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  user: PropTypes.object,
  isAdmin: PropTypes.bool,
  backHref: PropTypes.string,
};
