import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SnackBar } from "../SnackBar";

describe("SnackBar", () => {
  const open = { open: true, severity: "error" as const, message: "Message" };

  it("reste ouvert sur un clic en dehors du message", async () => {
    const setSnack = jest.fn();
    render(
      <div>
        <button>Ailleurs</button>
        <SnackBar snack={open} setSnack={setSnack} />
      </div>
    );

    // Le ClickAwayListener de MUI ne s'active qu'au tick suivant l'ouverture.
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.click(screen.getByText("Ailleurs"));

    expect(setSnack).not.toHaveBeenCalled();
  });

  it("se ferme avec le bouton de fermeture", () => {
    const setSnack = jest.fn();
    render(<SnackBar snack={open} setSnack={setSnack} />);

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(setSnack).toHaveBeenCalledWith({ open: false });
  });
});
