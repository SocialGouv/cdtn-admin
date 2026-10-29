import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { TemplateResetBlock } from "../TemplateResetBlock";
import { TemplateResetAnswer } from "../templateReset.query";
import {
  applyTemplateMutation,
  buildApplyTemplateVariables,
} from "../templateReset.mutation";

const answers: TemplateResetAnswer[] = [
  {
    id: "answer-1",
    contentType: "ANSWER",
    agreement: {
      id: "0029",
      name: "Hospitalisation privée",
      unextended: false,
    },
    status: "PUBLISHED",
  },
  {
    id: "answer-2",
    contentType: "NOTHING",
    agreement: { id: "0016", name: "Transports routiers", unextended: false },
    status: "VALIDATED",
  },
  {
    id: "answer-3",
    contentType: null,
    agreement: { id: "0573", name: "Commerces de gros", unextended: false },
    status: undefined,
  },
];

const renderBlock = (
  props: Partial<React.ComponentProps<typeof TemplateResetBlock>> = {}
) =>
  render(
    <TemplateResetBlock
      answers={answers}
      template="<p>template</p>"
      onApply={jest.fn().mockResolvedValue(undefined)}
      {...props}
    />
  );

const applyButton = () =>
  screen.getByRole("button", { name: /Appliquer le template à la sélection/ });

describe("TemplateResetBlock", () => {
  it("liste toutes les CC triées par IDCC, quels que soient leur type et leur statut", () => {
    renderBlock();
    const rows = screen.getAllByRole("row").slice(1);
    expect(
      rows.map((row) => within(row).getByRole("rowheader").textContent)
    ).toEqual(["0016", "0029", "0573"]);
    expect(
      within(rows[0]).getByText("La CC ne prévoit rien")
    ).toBeInTheDocument();
    expect(within(rows[0]).getByText("Validé")).toBeInTheDocument();
    expect(
      within(rows[1]).getByText("Afficher la réponse")
    ).toBeInTheDocument();
    expect(within(rows[2]).getByText("Non renseigné")).toBeInTheDocument();
    expect(within(rows[2]).getByText("À traiter")).toBeInTheDocument();
  });

  it("filtre par nom ou IDCC", async () => {
    renderBlock();
    await userEvent.type(
      screen.getByLabelText("Filtrer par nom ou IDCC"),
      "16"
    );
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Transports routiers")).toBeInTheDocument();
  });

  it("applique le template à la sélection après confirmation", async () => {
    const onApply = jest.fn().mockResolvedValue(undefined);
    renderBlock({ onApply });
    await userEvent.click(screen.getByLabelText(/0029 - Hospitalisation/));
    await userEvent.click(screen.getByLabelText(/0016 - Transports/));
    await userEvent.click(applyButton());
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /2 réponses sera remplacé.*« En rédaction »/
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    await waitFor(() =>
      expect(onApply).toHaveBeenCalledWith(["answer-1", "answer-2"])
    );
    expect(applyButton()).toHaveTextContent("(0)");
  });

  it("annule sans rien appliquer", async () => {
    const onApply = jest.fn();
    renderBlock({ onApply });
    await userEvent.click(screen.getByLabelText(/0573 - Commerces/));
    await userEvent.click(applyButton());
    await userEvent.click(screen.getByRole("button", { name: "Annuler" }));
    expect(onApply).not.toHaveBeenCalled();
    expect(applyButton()).toHaveTextContent("(1)");
  });

  it("conserve la sélection quand l'application échoue", async () => {
    const onApply = jest.fn().mockRejectedValue(new Error("refus"));
    renderBlock({ onApply });
    await userEvent.click(screen.getByLabelText(/0573 - Commerces/));
    await userEvent.click(applyButton());
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    await waitFor(() => expect(onApply).toHaveBeenCalled());
    expect(screen.getByLabelText(/0573 - Commerces/)).toBeChecked();
  });

  it("sélectionne toutes les CC affichées", async () => {
    renderBlock();
    await userEvent.click(
      screen.getByLabelText("Sélectionner toutes les CC affichées")
    );
    expect(applyButton()).toHaveTextContent("(3)");
  });

  it("bloque l'application sans template", async () => {
    renderBlock({ template: "  " });
    await userEvent.click(screen.getByLabelText(/0573 - Commerces/));
    expect(applyButton()).toBeDisabled();
    expect(
      screen.getByText(/Renseignez le template pour pouvoir l'appliquer/)
    ).toBeInTheDocument();
  });

  it("n'affiche rien sans réponse de CC", () => {
    const { container } = renderBlock({ answers: [] });
    expect(container).toBeEmptyDOMElement();
  });

  it("ne soumet pas le formulaire englobant", async () => {
    const onFormSubmit = jest.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onFormSubmit}>
        <TemplateResetBlock
          answers={answers}
          template="<p>template</p>"
          onApply={jest.fn().mockResolvedValue(undefined)}
        />
      </form>
    );
    await userEvent.click(screen.getByLabelText(/0573 - Commerces/));
    await userEvent.click(applyButton());
    await userEvent.click(screen.getByRole("button", { name: "Confirmer" }));
    expect(onFormSubmit).not.toHaveBeenCalled();
  });
});

describe("applyTemplateMutation", () => {
  it("remet en rédaction avant de remplacer le contenu (trigger anti-surlignage)", () => {
    const statusIndex = applyTemplateMutation.indexOf(
      "insert_contribution_answer_statuses"
    );
    const contentIndex = applyTemplateMutation.indexOf(
      "update_contribution_answers"
    );
    expect(statusIndex).toBeGreaterThan(-1);
    expect(statusIndex).toBeLessThan(contentIndex);
  });

  it("construit un statut « En rédaction » par réponse", () => {
    expect(
      buildApplyTemplateVariables(["a", "b"], "<p>t</p>", "user-1")
    ).toEqual({
      ids: ["a", "b"],
      content: "<p>t</p>",
      statuses: [
        { answer_id: "a", status: "REDACTING", user_id: "user-1" },
        { answer_id: "b", status: "REDACTING", user_id: "user-1" },
      ],
    });
  });
});
