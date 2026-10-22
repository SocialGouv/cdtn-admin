import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { Controller } from "react-hook-form";

import { Form } from "../Form";

// Les éditeurs Tiptap et les champs de références sont remplacés par de simples champs :
// ce test porte sur les règles du formulaire (champs obligatoires), pas sur l'édition.
jest.mock("src/components/forms", () => {
  const React = require("react");
  const { Controller } = require("react-hook-form");
  const Field = ({ name, control, label }: any) => (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }: any) => (
        <label>
          {label}
          <textarea
            value={value ?? ""}
            onChange={(event) => onChange(event.target.value)}
          />
          {error && <span>{error.message}</span>}
        </label>
      )}
    />
  );
  return {
    FormEditionField: Field,
    FormTextField: Field,
    FormSelect: () => null,
  };
});
jest.mock("../../../answers/references/LegiReferenceInput", () => ({
  LegiReferenceInput: () => null,
}));
jest.mock("../../../answers/references/OtherReferenceInput", () => ({
  OtherReferenceInput: () => null,
}));

const TEMPLATE_LABEL =
  /^Template « La convention collective prévoit des dispositions »/;

const fill = async (label: string | RegExp, value: string) => {
  await userEvent.type(screen.getByLabelText(label), value);
};

describe("Form — champs obligatoires à la création", () => {
  const renderCreation = (
    onSubmit = jest.fn().mockResolvedValue(undefined)
  ) => {
    render(<Form creation messages={[]} onSubmit={onSubmit} />);
    return onSubmit;
  };

  it("garde « Créer » désactivé tant que la réponse du Code du travail ou le template est vide", async () => {
    renderCreation();
    const button = screen.getByRole("button", { name: "Créer" });
    expect(button).toBeDisabled();

    await fill("Réponse du Code du travail", "Réponse");
    expect(button).toBeDisabled();

    await fill(TEMPLATE_LABEL, "Template");
    expect(button).toBeEnabled();
  });

  it("indique que le template est obligatoire", () => {
    renderCreation();
    expect(
      screen.getByText(/Obligatoire\. Proposé comme contenu/)
    ).toBeInTheDocument();
  });

  it("refuse la soumission sans template et liste l'erreur", async () => {
    const onSubmit = renderCreation();
    await fill("Nom de la question", "Question");
    await fill("Réponse du Code du travail", "Réponse");

    fireEvent.submit(
      screen.getByRole("button", { name: "Créer" }).closest("form")!
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Le template doit être renseigné"
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("remonte toutes les erreurs d'un coup", async () => {
    const onSubmit = renderCreation();
    await fill("Nom de la question", "Question");

    fireEvent.submit(
      screen.getByRole("button", { name: "Créer" }).closest("form")!
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "La réponse du Code du travail doit être renseignée"
    );
    expect(alert).toHaveTextContent("Le template doit être renseigné");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("soumet quand la réponse et le template sont renseignés, sans dialogue de confirmation", async () => {
    const onSubmit = renderCreation();
    await fill("Nom de la question", "Question");
    await fill("Réponse du Code du travail", "Réponse");
    await fill(TEMPLATE_LABEL, "Template");

    await userEvent.click(screen.getByRole("button", { name: "Créer" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      generic_answer_content: "Réponse",
      template_answer: "Template",
    });
    expect(screen.queryByText("Le template est vide")).not.toBeInTheDocument();
  });
});

describe("Form — édition d'une question", () => {
  it("ne rend pas le template obligatoire (questions existantes sans template)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <Form
        messages={[]}
        onSubmit={onSubmit}
        question={{
          id: "5c9d5c40-0c44-4bd5-a6b0-1f4d1a6a8b11",
          content: "Question existante",
          order: 12,
        }}
      />
    );
    expect(
      screen.queryByText(/Obligatoire\. Proposé comme contenu/)
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sauvegarder" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});
