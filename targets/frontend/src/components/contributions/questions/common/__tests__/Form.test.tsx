import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
// Les champs de références sont remplacés par un champ repérable, pour contrôler l'ordre
jest.mock("../../../answers/references/LegiReferenceInput", () => ({
  LegiReferenceInput: () => (
    <label>
      Références liées au code du travail
      <textarea />
    </label>
  ),
}));
jest.mock("../../../answers/references/OtherReferenceInput", () => ({
  OtherReferenceInput: () => (
    <label>
      Autres références
      <textarea />
    </label>
  ),
}));
// Le bloc de réinitialisation requête l'API (urql) : hors sujet pour ce test,
// qui porte sur les règles du formulaire.
jest.mock("../TemplateReset", () => ({
  TemplateReset: () => null,
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
    render(<Form creation onSubmit={onSubmit} />);
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

const LABELS = {
  agreement: "Texte applicable si la convention collective est traitée",
  agreementWithoutLegal:
    "Texte applicable si la convention collective est traitée et que le Code du travail ne prévoit rien",
  notHandled:
    "Texte applicable si la convention collective ne prévoit rien ou renvoie au Code du travail",
  notHandledWithoutLegal:
    "Texte applicable si la convention collective ne prévoit rien et que le Code du travail ne prévoit rien",
  legal: "Texte applicable pour le code du travail",
};

const inSection = (name: string | RegExp) =>
  within(screen.getByRole("region", { name }));

describe("Form — messages associés à la question", () => {
  it("n'affiche plus de liste de messages ni de pré-remplissage", () => {
    render(<Form creation onSubmit={jest.fn()} />);
    expect(screen.queryByText(/Pré-remplir/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Message associé à la question/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Messages associés à la question" })
    ).not.toBeInTheDocument();
  });

  it("place chaque message dans la section qui le concerne", () => {
    render(<Form creation onSubmit={jest.fn()} />);
    expect(
      inSection("Réponse au Code du travail").getByLabelText(LABELS.legal)
    ).toBeInTheDocument();
    expect(
      inSection("Cas particulier").getByLabelText(LABELS.notHandled)
    ).toBeInTheDocument();
    expect(
      inSection(
        "Template de réponse pour les conventions collectives"
      ).getByLabelText(LABELS.agreement)
    ).toBeInTheDocument();
  });

  it("met le message « code du travail » après la réponse et avant les références juridiques", () => {
    render(<Form creation onSubmit={jest.fn()} />);
    const labels = inSection("Réponse au Code du travail")
      .getAllByRole("textbox")
      .map((box) => box.closest("label")?.textContent ?? "");
    const index = (text: string | RegExp) =>
      labels.findIndex((label) =>
        typeof text === "string" ? label.includes(text) : text.test(label)
      );
    expect(
      index(/^Introduction de la réponse du Code du travail/)
    ).toBeLessThan(index(/^Réponse du Code du travail/));
    expect(index(/^Réponse du Code du travail/)).toBeLessThan(
      index(LABELS.legal)
    );
    expect(index(LABELS.legal)).toBeLessThan(
      index("Références liées au code du travail")
    );
    expect(index("Références liées au code du travail")).toBeLessThan(
      index("Autres références")
    );
  });

  it.each([
    ["Réponse au Code du travail", "Texte applicable pour le code du travail"],
    [
      "Cas particulier",
      "Texte applicable si la convention collective ne prévoit rien ou renvoie au Code du travail",
    ],
    [
      "Template de réponse pour les conventions collectives",
      "Texte applicable si la convention collective est traitée",
    ],
  ])(
    "précise dans la section « %s » que le message « %s » est affiché en bas de la page dans un bloc d'info",
    (section, label) => {
      render(<Form creation onSubmit={jest.fn()} />);
      const field = inSection(section).getByLabelText(label);
      const description = field.closest("label")?.parentElement?.textContent;
      expect(description).toContain(
        "Affiché en bas de la page dans un bloc d'info."
      );
    }
  );

  it("met le message « traitée » sous le template", () => {
    render(<Form creation onSubmit={jest.fn()} />);
    const labels = inSection(
      "Template de réponse pour les conventions collectives"
    )
      .getAllByRole("textbox")
      .map((box) => box.closest("label")?.textContent ?? "");
    expect(labels).toHaveLength(2);
    expect(labels[0]).toMatch(/^Template/);
    expect(labels[1]).toContain(LABELS.agreement);
  });

  it("cache à la création les deux messages « sans Code du travail »", () => {
    render(<Form creation onSubmit={jest.fn()} />);
    expect(
      screen.queryByLabelText(LABELS.agreementWithoutLegal)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(LABELS.notHandledWithoutLegal)
    ).not.toBeInTheDocument();
  });

  it("affiche à l'édition les messages « sans Code du travail », en dernier de « Cas particulier »", () => {
    render(
      <Form
        onSubmit={jest.fn()}
        question={{
          id: "5c9d5c40-0c44-4bd5-a6b0-1f4d1a6a8b11",
          content: "Question existante",
          order: 12,
        }}
      />
    );
    const labels = inSection("Cas particulier")
      .getAllByRole("textbox")
      .map((box) => box.closest("label")?.textContent ?? "");
    expect(labels.slice(-3)).toEqual([
      expect.stringContaining(LABELS.notHandled),
      expect.stringContaining(LABELS.agreementWithoutLegal),
      expect.stringContaining(LABELS.notHandledWithoutLegal),
    ]);
  });

  it("reprend les messages existants de la question à l'édition", () => {
    render(
      <Form
        onSubmit={jest.fn()}
        question={{
          id: "5c9d5c40-0c44-4bd5-a6b0-1f4d1a6a8b11",
          content: "Question existante",
          order: 12,
          message: {
            id: "m1",
            label: "Question 12 (abcd)",
            contentAgreement: "<p>traitée</p>",
            contentLegal: "<p>code du travail</p>",
            contentNotHandled: "<p>rien</p>",
          },
        }}
      />
    );
    expect(screen.getByLabelText(LABELS.agreement)).toHaveValue(
      "<p>traitée</p>"
    );
    expect(screen.getByLabelText(LABELS.legal)).toHaveValue(
      "<p>code du travail</p>"
    );
    expect(screen.getByLabelText(LABELS.notHandled)).toHaveValue("<p>rien</p>");
  });
});

describe("Form — édition d'une question", () => {
  it("ne rend pas le template obligatoire (questions existantes sans template)", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <Form
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
