import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useForm } from "react-hook-form";

import { CdtReferencesBlock } from "../CdtReferencesBlock";

const items = [
  {
    type: "legi" as const,
    label: "Article L3141-1 du code du travail",
    url: "https://legi/L3141-1",
  },
  { type: "other" as const, label: "Circulaire", url: "https://circulaire" },
];

const Harness = ({
  mode,
  disabled,
  initial = [],
  onChange,
  list = items,
}: {
  mode: "readonly" | "selectable";
  disabled?: boolean;
  initial?: string[];
  onChange?: (urls: string[]) => void;
  list?: typeof items;
}) => {
  const { control, watch } = useForm({
    defaultValues: { selectedCdtReferenceUrls: initial },
  });
  onChange?.(watch("selectedCdtReferenceUrls"));
  return (
    <CdtReferencesBlock
      mode={mode}
      items={list}
      genericAnswerId="generic-id"
      name="selectedCdtReferenceUrls"
      control={control}
      disabled={disabled}
    />
  );
};

describe("CdtReferencesBlock", () => {
  describe("lecture seule", () => {
    it("liste les références avec le texte explicatif et le lien vers la réponse générique", () => {
      render(<Harness mode="readonly" />);
      expect(
        screen.getByText(/ajoutées automatiquement lors de l'export/)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "réponse du Code du travail" })
      ).toHaveAttribute("href", "/contributions/answers/generic-id");
      expect(
        screen.getByText(/Article L3141-1 du code du travail/)
      ).toBeInTheDocument();
      expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    });

    it("indique qu'il n'y a aucune référence", () => {
      render(<Harness mode="readonly" list={[]} />);
      expect(
        screen.getByText("Aucune référence du Code du travail.")
      ).toBeInTheDocument();
    });
  });

  describe("cases à cocher", () => {
    it("propose une case décochée par référence", () => {
      render(<Harness mode="selectable" />);
      const boxes = screen.getAllByRole("checkbox");
      expect(boxes).toHaveLength(2);
      boxes.forEach((box) => expect(box).not.toBeChecked());
    });

    it("coche et décoche en conservant les URL", async () => {
      const onChange = jest.fn();
      render(<Harness mode="selectable" onChange={onChange} />);
      await userEvent.click(
        screen.getByLabelText(/Article L3141-1 du code du travail/)
      );
      expect(onChange).toHaveBeenLastCalledWith(["https://legi/L3141-1"]);
      await userEvent.click(screen.getByLabelText(/Circulaire/));
      expect(onChange).toHaveBeenLastCalledWith([
        "https://legi/L3141-1",
        "https://circulaire",
      ]);
      await userEvent.click(
        screen.getByLabelText(/Article L3141-1 du code du travail/)
      );
      expect(onChange).toHaveBeenLastCalledWith(["https://circulaire"]);
    });

    it("restitue une sélection existante", () => {
      render(<Harness mode="selectable" initial={["https://circulaire"]} />);
      expect(screen.getByLabelText(/Circulaire/)).toBeChecked();
    });

    it("désactive les cases quand la réponse n'est pas éditable", () => {
      render(<Harness mode="selectable" disabled />);
      screen
        .getAllByRole("checkbox")
        .forEach((box) => expect(box).toBeDisabled());
    });

    it("n'affiche rien quand il n'y a aucune référence", () => {
      const { container } = render(<Harness mode="selectable" list={[]} />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
