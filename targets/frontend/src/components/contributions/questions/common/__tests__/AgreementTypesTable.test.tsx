import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { useState } from "react";

import { AgreementTypesTable } from "../AgreementTypesTable";
import { AgreementTypes, initAgreementTypes } from "../agreementTypes";

const agreements = [
  { id: "0016", name: "Transports routiers", unextended: false },
  { id: "0029", name: "Hospitalisation privée", unextended: true },
  { id: "1486", name: "Bureaux d'études", unextended: false },
];

const Harness = () => {
  const [types, setTypes] = useState<AgreementTypes>(
    initAgreementTypes(agreements)
  );
  return (
    <AgreementTypesTable
      agreements={agreements}
      types={types}
      onChange={setTypes}
    />
  );
};

describe("AgreementTypesTable", () => {
  it("affiche le compteur des CC restantes et le badge « À renseigner »", () => {
    render(<Harness />);
    expect(screen.getByText("2 CC restantes à renseigner")).toBeInTheDocument();
    expect(screen.getAllByText("À renseigner")).toHaveLength(2);
  });

  it("verrouille la CC non étendue sur « ne prévoit rien »", () => {
    render(<Harness />);
    const radio = screen.getByLabelText(
      "Hospitalisation privée : La CC ne prévoit rien"
    );
    expect(radio).toBeChecked();
    expect(radio).toBeDisabled();
  });

  it("met à jour le compteur quand un type est choisi", async () => {
    render(<Harness />);
    await userEvent.click(
      screen.getByLabelText("Transports routiers : Afficher la réponse")
    );
    expect(screen.getByText("1 CC restante à renseigner")).toBeInTheDocument();
    await userEvent.click(
      screen.getByLabelText(
        "Bureaux d'études : La CC renvoie au Code du travail"
      )
    );
    expect(
      screen.getByText("Toutes les CC sont renseignées")
    ).toBeInTheDocument();
  });

  it("filtre par nom ou IDCC", async () => {
    render(<Harness />);
    await userEvent.type(
      screen.getByLabelText("Filtrer par nom ou IDCC"),
      "1486"
    );
    expect(screen.getByText("Bureaux d'études")).toBeInTheDocument();
    expect(screen.queryByText("Transports routiers")).not.toBeInTheDocument();
  });

  it("applique un type aux lignes sélectionnées", async () => {
    render(<Harness />);
    await userEvent.click(
      screen.getByLabelText("Sélectionner Transports routiers")
    );
    await userEvent.click(
      screen.getByLabelText("Sélectionner Bureaux d'études")
    );
    const button = screen.getByRole("button", {
      name: "Appliquer aux 2 lignes",
    });
    expect(button).toBeDisabled();

    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: /Type à appliquer/ })
    );
    const listbox = within(screen.getByRole("listbox"));
    await userEvent.click(listbox.getByText("Nous n'avons pas la réponse"));
    await userEvent.click(
      screen.getByRole("button", { name: "Appliquer aux 2 lignes" })
    );

    expect(
      screen.getByLabelText("Transports routiers : Nous n'avons pas la réponse")
    ).toBeChecked();
    expect(
      screen.getByText("Toutes les CC sont renseignées")
    ).toBeInTheDocument();
  });

  it("affiche les lignes triées par IDCC croissant, même filtrées", async () => {
    const unsorted = [
      { id: "1486", name: "Bureaux d'études", unextended: false },
      { id: "0016", name: "Transports routiers", unextended: false },
      { id: "0029", name: "Hospitalisation privée", unextended: true },
    ];
    const Sorted = () => {
      const [types, setTypes] = useState<AgreementTypes>(
        initAgreementTypes(unsorted)
      );
      return (
        <AgreementTypesTable
          agreements={unsorted}
          types={types}
          onChange={setTypes}
        />
      );
    };
    render(<Sorted />);
    const rowHeaders = () =>
      screen.getAllByRole("rowheader").map((cell) => cell.textContent);
    expect(rowHeaders()).toEqual(["0016", "0029", "1486"]);
    await userEvent.type(screen.getByLabelText("Filtrer par nom ou IDCC"), "e");
    expect(rowHeaders()).toEqual(["0016", "0029", "1486"]);
  });
});
