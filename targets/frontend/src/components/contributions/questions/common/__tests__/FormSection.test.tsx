import { render, screen } from "@testing-library/react";
import React from "react";

import { FormSection } from "../FormSection";

describe("FormSection", () => {
  it("expose une région nommée par son titre, avec sa description et son contenu", () => {
    render(
      <FormSection title="Cas particulier" description="Une description">
        <p>Contenu</p>
      </FormSection>
    );
    const region = screen.getByRole("region", { name: "Cas particulier" });
    expect(region).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Cas particulier" })
    ).toBeInTheDocument();
    expect(screen.getByText("Une description")).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });

  it("n'affiche pas de description quand elle est absente", () => {
    render(
      <FormSection title="Type de réponse">
        <p>Tableau</p>
      </FormSection>
    );
    expect(
      screen.getByRole("region", { name: "Type de réponse" })
    ).toBeInTheDocument();
    expect(screen.queryByText("Une description")).not.toBeInTheDocument();
  });
});
