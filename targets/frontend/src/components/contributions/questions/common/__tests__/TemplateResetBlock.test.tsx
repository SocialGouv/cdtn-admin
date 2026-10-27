import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { TemplateResetBlock } from "../TemplateResetBlock";
import { isResettable } from "../templateReset.query";

const answers = [
  {
    id: "answer-1",
    agreement: { id: "0029", name: "Terrains de camping" },
    resettable: true,
  },
  {
    id: "answer-2",
    agreement: { id: "0044", name: "Transports routiers" },
    resettable: false,
  },
  {
    id: "answer-3",
    agreement: { id: "0573", name: "Hostels" },
    resettable: true,
  },
];

describe("TemplateResetBlock", () => {
  it("propose une case par réponse réinitialisable, ignore les autres", () => {
    render(
      <TemplateResetBlock
        answers={answers}
        template="<p>template</p>"
        onReset={jest.fn()}
      />
    );
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByLabelText(/Terrains de camping/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hostels/)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Transports routiers/)
    ).not.toBeInTheDocument();
  });

  it("coche, réinitialise puis vide la sélection", async () => {
    const onReset = jest.fn().mockResolvedValue(undefined);
    render(
      <TemplateResetBlock
        answers={answers}
        template="<p>template</p>"
        onReset={onReset}
      />
    );
    await userEvent.click(screen.getByLabelText(/Terrains de camping/));
    await userEvent.click(screen.getByLabelText(/Hostels/));
    await userEvent.click(
      screen.getByRole("button", { name: /Réinitialiser la sélection \(2\)/ })
    );
    await waitFor(() => expect(onReset).toHaveBeenCalledWith(["answer-1", "answer-3"]));
  });

  it("désactive le bouton quand rien n'est sélectionné ou template vide", () => {
    render(
      <TemplateResetBlock
        answers={answers}
        template={undefined}
        onReset={jest.fn()}
      />
    );
    expect(
      screen.getByRole("button", { name: /Réinitialiser la sélection/ })
    ).toBeDisabled();
  });

  it("informe quand aucune réponse n'est réinitialisable", () => {
    render(
      <TemplateResetBlock
        answers={[answers[1]]}
        template="<p>template</p>"
        onReset={jest.fn()}
      />
    );
    expect(screen.getByText(/Aucune réponse réinitialisable/)).toBeInTheDocument();
  });
});

describe("isResettable", () => {
  it.each([
    [undefined, true],
    ["TODO", true],
    ["REDACTING", true],
    ["REDACTED", false],
    ["VALIDATING", false],
    ["VALIDATED", false],
    ["TO_PUBLISH", false],
  ])("statut %s → %s", (status, expected) => {
    expect(isResettable(status as any)).toBe(expected);
  });
});
