import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { useForm } from "react-hook-form";

import { NewsLinks } from "../NewsLinks";

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
  TitleBox: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock(
  "src/components/forms/CdtnReferences/cdtnReferencesSearch.query",
  () => ({
    useSearchCdtnReferencesQuery: () => ({
      data: [],
      fetching: false,
      error: undefined,
    }),
  })
);

const TestForm = () => {
  const { control } = useForm({ defaultValues: { links: [] } });
  return <NewsLinks control={control} />;
};

const fillAndValidate = (label: string, url: string) => {
  fireEvent.click(
    screen.getByRole("button", { name: /Ajouter un lien externe/ })
  );
  fireEvent.change(screen.getByLabelText("Libellé"), {
    target: { value: label },
  });
  fireEvent.change(screen.getByLabelText("URL"), { target: { value: url } });
  fireEvent.click(screen.getByRole("button", { name: "Valider" }));
};

describe("NewsLinks", () => {
  test("rejects a non-http URL with the zod message", () => {
    render(<TestForm />);
    fillAndValidate("Doc", "ftp://x");
    expect(
      screen.getByText("Le lien doit commencer par http:// ou https://")
    ).toBeInTheDocument();
  });

  test("adds an external link row showing its label and URL", () => {
    render(<TestForm />);
    fillAndValidate("Doc", "https://ex.fr");
    expect(screen.getByText("Doc")).toBeInTheDocument();
    expect(screen.getByText("https://ex.fr")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Modifier Doc" })
    ).toBeInTheDocument();
  });
});
