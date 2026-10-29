import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { useForm } from "react-hook-form";

import { NewsReferences } from "../NewsReferences";

// `fr` is only populated in the browser: every token read from it (colors,
// `fr.cx(...)`, ...) resolves to a placeholder string here.
jest.mock("@codegouvfr/react-dsfr", () => {
  const token = (): object =>
    new Proxy(() => "", {
      get: (_target, key) =>
        key === Symbol.toPrimitive ? () => "#000" : token(),
    });
  return { fr: token() };
});

jest.mock("src/components/forms/TitleBox", () => ({
  TitleBox: ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));

const legiArticle = {
  cid: "LEGIARTI000006901112",
  id: "LEGIARTI000006901112",
  label: "L1234-9",
};

jest.mock(
  "src/components/forms/LegiReferences/legiReferencesSearch.query",
  () => ({
    useContributionSearchLegiReferenceQuery: () => ({
      data: [{ legiArticle }],
      fetching: false,
      error: undefined,
    }),
  })
);

const TestForm = () => {
  const { control } = useForm({ defaultValues: { references: [] } });
  return <NewsReferences control={control} />;
};

const addArticle = () => {
  const input = screen.getByLabelText("Ajouter un article du code du travail");
  fireEvent.change(input, { target: { value: "L1234" } });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.click(within(screen.getByRole("listbox")).getByText("L1234-9"));
};

describe("NewsReferences", () => {
  test("is titled « Références »", () => {
    render(<TestForm />);
    expect(
      screen.getByRole("heading", { name: "Références" })
    ).toBeInTheDocument();
  });

  test("adds a code du travail article with an intro field", () => {
    render(<TestForm />);
    addArticle();

    expect(screen.getByText("Légifrance")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Texte d'introduction (facultatif)")
    ).toBeInTheDocument();
  });

  test("refuses the same article twice", () => {
    render(<TestForm />);
    addArticle();
    addArticle();

    expect(screen.getAllByText("Légifrance")).toHaveLength(1);
    expect(screen.getByText("Cet article est déjà ajouté")).toBeInTheDocument();
  });

  test("adds an external link with an intro", () => {
    render(<TestForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter un lien externe/ })
    );
    fireEvent.change(screen.getByLabelText("Libellé"), {
      target: { value: "Décret" },
    });
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    fireEvent.change(
      screen.getByLabelText("Texte d'introduction (facultatif)"),
      {
        target: { value: "Le décret" },
      }
    );

    expect(screen.getByText("Décret")).toBeInTheDocument();
    expect(screen.getByText("Externe")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Texte d'introduction (facultatif)")
    ).toHaveValue("Le décret");
  });

  test("rejects a non-http external URL", () => {
    render(<TestForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /Ajouter un lien externe/ })
    );
    fireEvent.change(screen.getByLabelText("Libellé"), {
      target: { value: "Doc" },
    });
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "ftp://x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));

    expect(
      screen.getByText("Le lien doit commencer par http:// ou https://")
    ).toBeInTheDocument();
  });
});
